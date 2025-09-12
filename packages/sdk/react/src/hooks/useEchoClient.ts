import {
  EchoClient,
  OAuthTokenProvider,
} from '@merit-systems/echo-typescript-sdk';
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

interface UseEchoClientOptions {
  apiUrl: string;
}

/**
 * Custom hook for managing EchoClient lifecycle
 * Handles client creation, token management, and cleanup
 */
export function useEchoClient({ apiUrl }: UseEchoClientOptions) {
  const auth = useAuth();
  const [client, setClient] = useState<EchoClient | null>(null);

  useEffect(() => {
    // Only recreate client when authentication state changes, not token refresh
    if (!auth.user) {
      setClient(null);
      return;
    }

    // Create client once when authenticated - token provider handles refresh internally
    const tokenProvider = new OAuthTokenProvider({
      getTokenFn: () => Promise.resolve(auth.user?.access_token || null),
      refreshTokenFn: async (): Promise<string> => {
        const user = await auth.signinSilent();
        if (!user) {
          throw new Error('Silent renew did not yield a new access token');
        }
        return user.access_token;
      },
      onRefreshErrorFn: async (error: Error) => {
        console.error('Token refresh failed:', error);
        await auth.removeUser();
        await auth.clearStaleState();
      },
    });

    const newClient = new EchoClient({
      baseUrl: apiUrl,
      tokenProvider,
    });

    setClient(newClient);

    return () => {
      setClient(null);
    };
  }, [
    apiUrl,
    auth.user,
    auth.user?.profile?.sub, // Only recreate if user ID changes
    auth.signinSilent,
    auth.signoutSilent,
  ]);

  return client;
}
