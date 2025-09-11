import { githubClient } from './client';

export const getUser = async (username: string) => {
  return githubClient.rest.users
    .getByUsername({
      username,
    })
    .then(res => {
      if (!res.data) {
        return null;
      }
      return res.data;
    });
};
