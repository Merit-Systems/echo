import { z } from 'zod';

import { getRepo } from './repo';
import { getUser } from './users';

export const githubLinkSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('user'),
    url: z
      .string()
      .url()
      .refine(
        val => /^https:\/\/github\.com\/[A-Za-z0-9_.-]+(\/)?$/.test(val),
        {
          message:
            'Must be a valid GitHub user URL (e.g. https://github.com/owner)',
        }
      ),
  }),
  z.object({
    type: z.literal('repo'),
    url: z
      .string()
      .url()
      .refine(
        val =>
          /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?$/.test(
            val
          ),
        {
          message:
            'Must be a valid GitHub repository URL (e.g. https://github.com/owner/repo)',
        }
      ),
  }),
]);

export type GithubLinkInput = z.infer<typeof githubLinkSchema>;

export const resolveGithubId = async (data: GithubLinkInput) => {
  if (data.type === 'user') {
    const username = data.url.split('/').pop();
    if (!username) {
      throw new Error('Invalid GitHub user URL');
    }
    const user = await getUser(username);
    if (!user) {
      throw new Error('User not found');
    }
    return user.id;
  }

  const [owner, repoName] = data.url.split('/').slice(-2);
  const repo = await getRepo(owner, repoName);
  if (!repo) {
    throw new Error('Repository not found');
  }
  return repo.id;
};
