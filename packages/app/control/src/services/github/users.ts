import { githubClient } from './client';

export const getUser = async (username: string) => {
  return githubClient.rest.users
    .getByUsername({
      username,
    })
    .then(res => res.data)
    .catch(error => {
      if (error.status === 404) {
        return null;
      }
      throw error;
    });
};
