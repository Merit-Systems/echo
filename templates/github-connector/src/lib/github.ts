import { App } from "@octokit/app";

export function getEnv(name: string, required = true): string | undefined {
  const value = process.env[name];
  if (required && (!value || value.length === 0)) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function normalizePrivateKey(pem: string): string {
  // Support keys provided with escaped newlines
  if (pem.includes("\\n")) return pem.replace(/\\n/g, "\n");
  return pem;
}

export function getGitHubAppInstallUrl(): string {
  const slug = getEnv("GITHUB_APP_SLUG")!;
  return `https://github.com/apps/${slug}/installations/new`;
}

export async function getInstallationTokenForRepo(
  owner: string,
  repo: string,
): Promise<string> {
  const app = new App({
    appId: getEnv("GITHUB_APP_ID")!,
    privateKey: normalizePrivateKey(getEnv("GITHUB_APP_PRIVATE_KEY")!),
  });
  // Get installation for the repo
  const installation = await app.octokit.request(
    "GET /repos/{owner}/{repo}/installation",
    {
      owner,
      repo,
    },
  );

  // Create installation access token
  const tokenResponse = await app.octokit.request(
    "POST /app/installations/{installation_id}/access_tokens",
    {
      installation_id: installation.data.id,
    },
  );

  return tokenResponse.data.token;
}
