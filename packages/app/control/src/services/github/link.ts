import { z } from 'zod';

import { getRepo } from './repo';
import { getUser } from './users';

import { githubLinkSchema } from './schema';

export const resolveGithubId = async (
  data: z.infer<typeof githubLinkSchema>
) => {
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
