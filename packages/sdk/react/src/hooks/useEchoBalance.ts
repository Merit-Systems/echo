import type { FreeBalance } from '@merit-systems/echo-typescript-sdk';
import { EchoClient, parseEchoError } from '@merit-systems/echo-typescript-sdk';
import useSWR from 'swr';
import { EchoBalance } from '../types';

export function useEchoBalance(echoClient: EchoClient | null, appId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    echoClient && appId ? ['balance', appId] : null,
    async () => {
      if (!echoClient) {
        throw new Error('Not authenticated');
      }

      try {
        const [balanceResponse, freeTierResponse] = await Promise.all([
          echoClient.balance.getBalance(),
          echoClient.balance.getFreeBalance(appId),
        ]);

        return {
          balance: balanceResponse,
          freeTierBalance: freeTierResponse,
        };
      } catch (err) {
        const echoError = parseEchoError(
          err instanceof Error ? err : new Error(String(err)),
          'refreshing balance'
        );
        throw echoError;
      }
    },
    {
      errorRetryCount: 2,
      revalidateOnFocus: true,
      dedupingInterval: 30000, // 30s deduping
    }
  );

  return {
    balance: data?.balance || null,
    freeTierBalance: data?.freeTierBalance || null,
    error: error?.message || null,
    isLoading,
    refreshBalance: mutate,
  };
}
