import { Octokit } from 'octokit';

export const githubClient = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
