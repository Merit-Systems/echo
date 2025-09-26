import { openai } from '@/echo';
import { getEnv, normalizePrivateKey } from '@/lib/github';
import { App } from '@octokit/app';
import { convertToModelMessages, streamText } from 'ai';

export const maxDuration = 30;

async function fetchReadmeContent(
  owner: string,
  repo: string
): Promise<string> {
  const app = new App({
    appId: getEnv('GITHUB_APP_ID')!,
    privateKey: normalizePrivateKey(getEnv('GITHUB_APP_PRIVATE_KEY')!),
  });

  const installation = await app.octokit.request(
    'GET /repos/{owner}/{repo}/installation',
    { owner, repo }
  );

  const octokit = await app.getInstallationOctokit(installation.data.id);

  const { data: readmeData } = await octokit.request(
    'GET /repos/{owner}/{repo}/readme',
    { owner, repo }
  );

  return Buffer.from(readmeData.content, 'base64').toString('utf-8');
}

function constructPrompt(
  owner: string,
  repo: string,
  readmeContent: string
): string {
  return `Please provide a concise summary of this GitHub repository based on its README:

**Repository:** ${owner}/${repo}

**README Content:**
${readmeContent}

Focus on what the project does, its main features, and how to use it. Be concise and helpful.`;
}

export async function POST(req: Request) {
  const { owner, repo } = await req.json();

  if (!owner || !repo) {
    return new Response(
      JSON.stringify({ error: 'Owner and repo are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const readmeContent = await fetchReadmeContent(owner, repo);
    const enhancedPrompt = constructPrompt(owner, repo, readmeContent);

    const result = streamText({
      model: openai('gpt-4o'),
      messages: convertToModelMessages([
        {
          role: 'user',
          parts: [{ type: 'text', text: enhancedPrompt }],
        },
      ]),
      system:
        'You are a helpful assistant that summarizes GitHub repositories. Provide concise summaries focusing on what the project does, its main features, and how to use it.',
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: `Failed to fetch README for ${owner}/${repo}. Make sure the repository exists and the GitHub App has access to it.`,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
