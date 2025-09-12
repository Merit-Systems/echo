import { githubClient } from './client';

export const getRepo = async (owner: string, repo: string) => {
  return githubClient.rest.repos
    .get({
      owner,
      repo,
    })
    .then(res => res.data)
    .catch(error => {
      if (error.status === 404) {
        return null;
      }
      throw error;
    });
};
