'use client';

import { ReactNode, useCallback, useMemo } from 'react';
import type { EchoUser } from '@merit-systems/echo-react-sdk';
import { EchoProviderRaw } from '@merit-systems/echo-react-sdk';
import { EchoClient, validateAppId } from '@merit-systems/echo-typescript-sdk';
import useSWR from 'swr';

export interface EchoProxyConfig {
  appId: string;
  basePath?: string; // default '/api/echo'
  initialSession?: { isAuthenticated: boolean; user?: EchoUser | null };
}

function useProxySession(
  basePath: string,
  initial?: EchoProxyConfig['initialSession']
) {
  const {
    data: session,
    error,
    isLoading,
  } = useSWR(
    ['session', basePath],
    async () => {
      const res = await fetch(`${basePath}/session`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Session ${res.status}`);
      return res.json();
    },
    {
      fallbackData: initial,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 2,
    }
  );

  return {
    isAuthenticated: session?.isAuthenticated ?? false,
    isLoading,
    error: error?.message ?? null,
  };
}

interface EchoProviderProps {
  config: EchoProxyConfig;
  children: ReactNode;
}

export function EchoProvider({ config, children }: EchoProviderProps) {
  validateAppId(config.appId, 'EchoProvider');

  const basePath = config.basePath || '/api/echo';
  const session = useProxySession(basePath, config.initialSession);

  const echoClient = useMemo(
    () =>
      session.isAuthenticated
        ? new EchoClient({
            baseUrl: `${basePath}/proxy`,
            apiKey: 'next-sdk-proxy',
          })
        : null,
    [basePath, session.isAuthenticated]
  );

  const signIn = useCallback(async () => {
    const returnTo =
      typeof window !== 'undefined' ? window.location.href : undefined;
    const url = `${basePath}/signin${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
    window.location.href = url;
  }, [basePath]);

  const signOut = useCallback(async () => {
    window.location.href = `${basePath}/signout`;
  }, [basePath]);

  const getToken = useCallback(async () => null, []);

  return (
    <EchoProviderRaw
      config={{ appId: config.appId } as any}
      rawUser={null}
      isLoggedIn={session.isAuthenticated}
      isAuthLoading={session.isLoading}
      authError={session.error ? new Error(session.error) : null}
      echoClient={echoClient}
      signIn={signIn}
      signOut={signOut}
      getToken={getToken}
    >
      {children}
    </EchoProviderRaw>
  );
}
