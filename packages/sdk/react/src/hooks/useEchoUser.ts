import { EchoClient, parseEchoError } from '@merit-systems/echo-typescript-sdk';
import useSWR from 'swr';
import { EchoUser } from '../types';

export function useEchoUser(echoClient: EchoClient | null) {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR(
    echoClient ? ['user'] : null,
    async () => {
      if (!echoClient) {
        throw new Error('Not authenticated');
      }

      try {
        const userResponse = await echoClient.users.getUserInfo();
        return userResponse;
      } catch (err) {
        const echoError = parseEchoError(
          err instanceof Error ? err : new Error(String(err)),
          'refreshing user'
        );
        throw echoError;
      }
    },
    {
      errorRetryCount: 2,
      revalidateOnFocus: true,
      dedupingInterval: 60000, // 1min deduping for user data
    }
  );

  return {
    user: user || null,
    error: error?.message || null,
    isLoading,
    refreshUser: mutate,
  };
}
