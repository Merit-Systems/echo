import type {
  EchoClient,
  EchoConfig,
  FreeBalance,
} from '@merit-systems/echo-typescript-sdk';
import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AuthProvider,
  AuthProviderUserManagerProps,
  useAuth,
} from 'react-oidc-context';
import { useEchoBalance } from '../hooks/useEchoBalance';
import { useEchoClient } from '../hooks/useEchoClient';
import { useEchoPayments } from '../hooks/useEchoPayments';
import { EchoAuthConfig, EchoBalance, EchoUser } from '../types';

export interface PaymentRequiredInfo {
  message: string;
  endpoint?: string;
  context?: string;
  timestamp: number;
}

export interface EchoContextValue {
  // Auth & User
  rawUser: User | null | undefined; // directly piped from oidc
  user: EchoUser | null; // directly piped from oidc
  balance: EchoBalance | null;
  freeTierBalance: FreeBalance | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  echoClient: EchoClient | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  createPaymentLink: (
    amount: number,
    description?: string,
    successUrl?: string
  ) => Promise<string>;
  getToken: () => Promise<string | null>;
  clearAuth: () => Promise<void>;
  config: EchoConfig;
  // 402 Payment Required handling
  paymentRequired: PaymentRequiredInfo | null;
  clearPaymentRequired: () => void;
}

// Separate context for refresh state to prevent unnecessary re-renders
export interface EchoRefreshContextValue {
  isRefreshing: boolean;
}

export const EchoContext = createContext<EchoContextValue | null>(null);
export const EchoRefreshContext = createContext<EchoRefreshContextValue | null>(
  null
);

interface EchoProviderProps {
  config: EchoAuthConfig;
  children: ReactNode;
}

// Internal provider that handles everything
function EchoProviderInternal({ config, children }: EchoProviderProps) {
  const auth = useAuth();

  const user = auth.user;
  const echoUser: EchoUser | null = user ? parseEchoUser(user) : null;
  const apiUrl = config.baseEchoUrl || 'https://echo.merit.systems';
  const token = auth.user?.access_token || null;

  const echoClient = useEchoClient({ apiUrl });

  // 402 Payment Required state
  const [paymentRequired, setPaymentRequired] =
    useState<PaymentRequiredInfo | null>(null);

  const {
    balance,
    freeTierBalance,
    refreshBalance,
    error: balanceError,
    isLoading: balanceLoading,
  } = useEchoBalance(echoClient, config.appId);

  const {
    createPaymentLink,
    error: paymentError,
    isLoading: paymentLoading,
  } = useEchoPayments(echoClient);

  const clearAuth = useCallback(async () => {
    try {
      await auth.removeUser();
    } catch (err) {
      console.error('Error during auth cleanup:', err);
    }
  }, [auth.removeUser]);

  const getToken = useCallback(async (): Promise<string | null> => {
    return auth.user?.access_token || null;
  }, [auth.user?.access_token]);

  const clearPaymentRequired = useCallback(() => {
    setPaymentRequired(null);
  }, []);

  // Set up fetch interceptor to catch 402 responses
  useEffect(() => {
    const originalFetch = globalThis.fetch;

    // Only set up interceptor if not already done
    if (!(originalFetch as any)._echoIntercepted) {
      globalThis.fetch = async (...args: Parameters<typeof fetch>) => {
        try {
          const response = await originalFetch(...args);

          // Check for 402 Payment Required responses
          if (response.status === 402) {
            let message = 'Payment Required';
            let endpoint = '';

            try {
              // Try to extract error message from response
              const responseClone = response.clone();
              const errorText = await responseClone.text();
              if (errorText) {
                message = errorText;
              }
            } catch (err) {
              console.warn('Could not read 402 response body:', err);
            }

            // Extract endpoint from request URL
            if (args[0]) {
              if (typeof args[0] === 'string') {
                endpoint = args[0];
              } else if (args[0] instanceof Request) {
                endpoint = args[0].url;
              } else if (args[0] instanceof URL) {
                endpoint = args[0].toString();
              }
            }

            // Set payment required state
            setPaymentRequired({
              message,
              endpoint,
              context: 'LLM request',
              timestamp: Date.now(),
            });

            // Also refresh balance to show current state
            if (echoClient) {
              refreshBalance().catch(err => {
                console.error('Failed to refresh balance after 402:', err);
              });
            }
          }

          return response;
        } catch (error) {
          // Re-throw any network errors
          throw error;
        }
      };

      // Mark that we've already intercepted to avoid double-wrapping
      (globalThis.fetch as any)._echoIntercepted = true;
    }

    // Cleanup function
    return () => {
      // Note: We don't restore the original fetch here because other components
      // might still need the interceptor. In a real app, you'd want a more
      // sophisticated cleanup mechanism.
    };
  }, [echoClient, refreshBalance]);

  // Combine errors from different sources
  const combinedError =
    auth.error?.message || balanceError || paymentError || null;

  // Only include auth.isLoading for initial authentication, not token refresh
  // Token refresh should be transparent to downstream components
  const isInitialAuthLoading = auth.isLoading && !auth.isAuthenticated;
  const isTokenRefreshing = auth.isLoading && auth.isAuthenticated;
  const combinedLoading =
    isInitialAuthLoading || balanceLoading || paymentLoading;

  // Main context - stable during token refresh
  const contextValue: EchoContextValue = useMemo(
    () => ({
      user: echoUser || null,
      rawUser: user,
      balance,
      freeTierBalance,
      isAuthenticated: auth.isAuthenticated,
      isLoading: combinedLoading,
      error: combinedError,
      token,
      echoClient,
      signIn: auth.signinRedirect,
      signOut: clearAuth,
      refreshBalance,
      createPaymentLink,
      getToken,
      clearAuth,
      config,
      paymentRequired,
      clearPaymentRequired,
    }),
    [
      echoUser,
      user,
      balance,
      freeTierBalance,
      auth.isAuthenticated,
      combinedLoading,
      combinedError,
      token,
      echoClient,
      auth.signinRedirect,
      clearAuth,
      refreshBalance,
      createPaymentLink,
      getToken,
      config,
      paymentRequired,
      clearPaymentRequired,
    ]
  );

  // Separate refresh context - only components that need refresh state will re-render
  const refreshContextValue: EchoRefreshContextValue = useMemo(
    () => ({
      isRefreshing: isTokenRefreshing,
    }),
    [isTokenRefreshing]
  );

  return (
    <EchoContext.Provider value={contextValue}>
      <EchoRefreshContext.Provider value={refreshContextValue}>
        {children}
      </EchoRefreshContext.Provider>
    </EchoContext.Provider>
  );
}

// Main provider that wraps react-oidc-context
export function EchoProvider({ config, children }: EchoProviderProps) {
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
      <EchoProviderInternal config={config}>{children}</EchoProviderInternal>
    </AuthProvider>
  );
}

function parseEchoUser(user: User): EchoUser {
  return {
    id: user.profile.sub || '',
    email: user.profile.email || '',
    name: user.profile.name || user.profile.preferred_username || '',
    picture: user.profile.picture || '',
  };
}
