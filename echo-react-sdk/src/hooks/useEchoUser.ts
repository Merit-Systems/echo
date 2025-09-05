import { EchoClient, parseEchoError } from '@merit-systems/echo-typescript-sdk';
import { useCallback, useEffect, useState } from 'react';
import { EchoUser } from '../types';

export function useEchoUser(echoClient: EchoClient | null) {
  const [user, setUser] = useState<EchoUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    if (!echoClient) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    try {
      const userResponse = await echoClient.users.getUserInfo();

      setUser(userResponse);
      setError(null);
    } catch (err) {
      const echoError = parseEchoError(
        err instanceof Error ? err : new Error(String(err)),
        'refreshing user'
      );
      setError(echoError.message);
      throw echoError;
    } finally {
      setIsLoading(false);
    }
  }, [echoClient]);

  useEffect(() => {
    if (echoClient) {
      refreshUser().catch(err => {
        console.error('Error loading initial user:', err);
      });
    } else {
      setUser(null);
      setError(null);
    }
  }, [echoClient, refreshUser]);

  return {
    user,
    error,
    isLoading,
    refreshUser,
  };
}
