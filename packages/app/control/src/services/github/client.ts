import { Octokit } from 'octokit';
import { env } from '@/env';

export const githubClient = new Octokit({
  auth: env.GITHUB_TOKEN,
});
