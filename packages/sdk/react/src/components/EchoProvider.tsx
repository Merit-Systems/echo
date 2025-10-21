import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import type { User } from 'oidc-client-ts';
import {
  AuthProvider,
  AuthProviderUserManagerProps,
  useAuth,
} from 'react-oidc-context';
import type { EchoClient } from '@merit-systems/echo-typescript-sdk';
import { validateAppId } from '@merit-systems/echo-typescript-sdk';
import { useEchoBalance } from '../hooks/useEchoBalance';
import { useEchoClient } from '../hooks/useEchoClient';
import { useEchoPayments } from '../hooks/useEchoPayments';
import { useEchoUser } from '../hooks/useEchoUser';
import { EchoAuthConfig } from '../types';
import { EchoContext, EchoContextValue } from '../context';

export interface EchoProviderRawProps {
  children: ReactNode;

  config: EchoAuthConfig;

  isAuthLoading: boolean;
  authError: Error | null | undefined;

  rawUser: User | null | undefined;
  isLoggedIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;

  echoClient: EchoClient | null;
}

/**
 * Raw provider that manages Echo context without built-in authentication.
 *
 * Design: Single internal context with useEcho() hook for both SDK and client components.
 * Accepts auth state/methods from parent, enabling custom auth implementations (Next.js proxy, etc).
 *
 * @param rawUser - OIDC user object from parent auth provider
 * @param isLoggedIn - Auth state from parent
 * @param signIn/signOut/getToken - Auth methods from parent
 * @param echoClient - Configured Echo API client
 */
export function EchoProviderRaw({
  config,
  children,

  isAuthLoading,
  authError,

  rawUser,
  isLoggedIn,

  signIn,
  signOut,
  getToken,

  echoClient,
}: EchoProviderRawProps) {
  // Insufficient funds state - shared across all components
  const [isInsufficientFunds, setIsInsufficientFunds] = useState(false);

  const {
    balance,
    freeTierBalance,
    refreshBalance,
    error: balanceError,
    isLoading: balanceLoading,
  } = useEchoBalance(echoClient, config.appId);

  const {
    user: echoUser,
    error: userError,
    isLoading: userLoading,
  } = useEchoUser(echoClient);

  const {
    createPaymentLink,
    error: paymentError,
    isLoading: paymentLoading,
  } = useEchoPayments(echoClient);

  // Combine errors from different sources
  const combinedError =
    authError?.message || balanceError || paymentError || userError || null;

  // Only include isLoading for initial authentication, not token refresh
  // Token refresh should be transparent to downstream components
  const isInitialAuthLoading = isAuthLoading && !isLoggedIn;
  const combinedLoading =
    isInitialAuthLoading || balanceLoading || paymentLoading || userLoading;

  // Main context - stable during token refresh
  const contextValue: EchoContextValue = useMemo(
    () => ({
      user: echoUser,
      rawUser,
      balance,
      freeTierBalance,
      isLoggedIn,
      isLoading: combinedLoading,
      error: combinedError,
      echoClient,
      signIn: signIn,
      signOut: signOut,
      refreshBalance,
      createPaymentLink,
      getToken,
      config,
      isInsufficientFunds,
      setIsInsufficientFunds,
    }),
    [
      echoUser,
      rawUser,
      balance,
      freeTierBalance,
      isLoggedIn,
      combinedLoading,
      combinedError,
      echoClient,
      signIn,
      signOut,
      refreshBalance,
      createPaymentLink,
      getToken,
      config,
      isInsufficientFunds,
    ]
  );

  return (
    <EchoContext.Provider value={contextValue}>{children}</EchoContext.Provider>
  );
}

// Intermediate provider that uses auth and creates EchoClient
function EchoProviderWithAuth({ config, children }: EchoProviderProps) {
  const auth = useAuth();
  const apiUrl = config.baseEchoUrl || 'https://echo.merit.systems';
  const echoClient = useEchoClient({ apiUrl });

  const signOut = useCallback(async () => {
    try {
      await auth.removeUser();
    } catch (err) {
      console.error('Error during auth cleanup:', err);
    }
  }, [auth.removeUser]);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (auth.user?.expired) {
      return (await auth.signinSilent())?.access_token || null;
    }
    return auth.user?.access_token || null;
  }, [auth.user?.access_token, auth.signinSilent]);

  const isLoggedIn = !!auth.user;

  return (
    <EchoProviderRaw
      config={config}
      rawUser={auth.user}
      isLoggedIn={isLoggedIn}
      isAuthLoading={auth.isLoading}
      authError={auth.error}
      echoClient={echoClient}
      signIn={auth.signinRedirect}
      signOut={signOut}
      getToken={getToken}
    >
      {children}
    </EchoProviderRaw>
  );
}

interface EchoProviderProps {
  config: EchoAuthConfig;
  children: ReactNode;
}

// Main provider that wraps react-oidc-context
export function EchoProvider({ config, children }: EchoProviderProps) {
  validateAppId(config.appId, 'EchoProvider');

  const [isClient, setIsClient] = useState(false);

  // Handle client-side mounting for SSR compatibility
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server-side
  if (!isClient) {
    return null;
  }

  const apiUrl = config.baseEchoUrl || 'https://echo.merit.systems';

  const oidcConfig: AuthProviderUserManagerProps = {
    userManager:
      (typeof window !== 'undefined' && (window as any).__echoUserManager) ||
      new UserManager({
        authority: apiUrl,
        client_id: config.appId,
        redirect_uri: config.redirectUri || window.location.origin,
        scope: config.scope || 'llm:invoke offline_access',
        silentRequestTimeoutInSeconds: 10,
        automaticSilentRenew: true,

        // Silent renewal configuration
        silent_redirect_uri: config.redirectUri || window.location.origin,
        includeIdTokenInSilentRenew: false,

        validateSubOnSilentRenew: true,

        // UserInfo endpoint configuration
        loadUserInfo: true,

        // Custom OAuth endpoints (non-standard OIDC)
        metadata: {
          authorization_endpoint: `${apiUrl}/api/oauth/authorize`,
          token_endpoint: `${apiUrl}/api/oauth/token`,
          userinfo_endpoint: `${apiUrl}/api/oauth/userinfo`,
          issuer: apiUrl,
          jwks_uri: `${apiUrl}/.well-known/jwks.json`,
          end_session_endpoint: `${apiUrl}/api/oauth/logout`,
        },
        userStore: new WebStorageStateStore({ store: window.localStorage }),
      }),

    // Remove URL parameters after successful authentication
    onSigninCallback: () => {
      // Clean up URL after auth
      if (window.location.search.includes('code=')) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    },
  };

  return (
    <AuthProvider {...oidcConfig}>
      <EchoProviderWithAuth config={config}>{children}</EchoProviderWithAuth>
    </AuthProvider>
  );
}
