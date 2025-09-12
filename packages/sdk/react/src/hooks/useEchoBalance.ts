import type { FreeBalance } from '@merit-systems/echo-typescript-sdk';
import { EchoClient, parseEchoError } from '@merit-systems/echo-typescript-sdk';
import { useCallback, useEffect, useState } from 'react';
import { EchoBalance } from '../types';

export function useEchoBalance(echoClient: EchoClient | null, appId: string) {
  const [balance, setBalance] = useState<EchoBalance | null>(null);
  const [freeTierBalance, setFreeTierBalance] = useState<FreeBalance | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!echoClient) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    try {
      const [balanceResponse, freeTierResponse] = await Promise.all([
        echoClient.balance.getBalance(),
        echoClient.balance.getFreeBalance(appId),
      ]);

      setBalance(balanceResponse);
      setFreeTierBalance(freeTierResponse);
      setError(null);
    } catch (err) {
      const echoError = parseEchoError(
        err instanceof Error ? err : new Error(String(err)),
        'refreshing balance'
      );
      setError(echoError.message);
      throw echoError;
    } finally {
      setIsLoading(false);
    }
  }, [echoClient, appId]);

  useEffect(() => {
    if (echoClient && appId) {
      refreshBalance().catch(err => {
        console.error('Error loading initial balance:', err);
      });
    } else {
      setBalance(null);
      setFreeTierBalance(null);
      setError(null);
    }
  }, [echoClient, appId, refreshBalance]);

  return {
    balance,
    freeTierBalance,
    error,
    isLoading,
    refreshBalance,
  };
}
