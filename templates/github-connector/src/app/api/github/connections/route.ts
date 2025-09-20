import { getUser } from "@/echo";
import { getSupabaseServer } from "@/lib/supabase";
import { App } from "@octokit/app";
import { NextResponse } from "next/server";

type RepoMeta = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
  owner: { login: string; id: number; html_url: string };
};

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
  owner: { login: string; id: number; html_url: string };
};

export async function GET() {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseServer();
  const { data: installs, error } = await supabase
    .from("github_installations")
    .select("installation_id, account_login, account_id")
    .eq("echo_user_id", user.id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const app = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
  });

  const connections: Array<{
    installation_id: number;
    account_login?: string | null;
    account_id?: number | null;
    repositories: RepoMeta[];
  }> = [];

  for (const inst of installs ?? []) {
    const octokit = await app.getInstallationOctokit(
      Number(inst.installation_id),
    );
    // List repositories accessible to the installation
    const repos: RepoMeta[] = [];
    let page = 1;
    while (true) {
      const { data } = await octokit.request("GET /installation/repositories", {
        per_page: 100,
        page,
      });
      for (const r of data.repositories as GitHubRepo[]) {
        const repo = r;
        repos.push({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          private: repo.private,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
          owner: {
            login: repo.owner?.login,
            id: repo.owner?.id,
            html_url: repo.owner?.html_url,
          },
        });
      }
      if (data.repositories.length < 100) break;
      page += 1;
    }
    connections.push({
      installation_id: Number(inst.installation_id),
      account_login: inst.account_login ?? null,
      account_id: inst.account_id ?? null,
      repositories: repos,
    });
  }

  return NextResponse.json({ connections });
}
