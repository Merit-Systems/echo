import { githubClient } from './client';

export const getRepo = async (owner: string, repo: string) => {
  return githubClient.rest.repos
    .get({
      owner,
      repo,
    })
    .then(res => {
      if (!res.data) {
        return null;
      }
      return res.data;
    })
    .catch(() => {
      return null;
    });
};
