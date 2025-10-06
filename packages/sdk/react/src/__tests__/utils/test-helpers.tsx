import { render } from '@testing-library/react';
import React from 'react';
import { EchoProvider } from '../../components/EchoProvider';
import { EchoAuthConfig } from '../../types';

/**
 * Default test configuration for EchoProvider
 */
const defaultTestConfig: EchoAuthConfig = {
  appId: '60601628-cdb7-481e-8f7e-921981220348',
  baseEchoUrl: 'http://localhost:3000',
  redirectUri: 'http://localhost:3000/callback',
  scope: 'llm:invoke offline_access',
};

/**
 * Wrapper component for testing EchoProvider
 */
interface TestEchoProviderProps {
  children: React.ReactNode;
  config?: Partial<EchoAuthConfig>;
  mockUserManager?: unknown;
}

export function TestEchoProvider({
  children,
  config = {},
  mockUserManager,
}: TestEchoProviderProps) {
  const testConfig = { ...defaultTestConfig, ...config };

  // Mock UserManager if provided - set immediately before rendering
  if (mockUserManager && typeof window !== 'undefined') {
    (
      window as typeof window & { __echoUserManager?: unknown }
    ).__echoUserManager = mockUserManager;
  }

  return <EchoProvider config={testConfig}>{children}</EchoProvider>;
}

/**
 * Render component with EchoProvider wrapper
 */
export function renderWithEcho(
  component: React.ReactElement,
  options: {
    config?: Partial<EchoAuthConfig>;
    mockUserManager?: unknown;
  } = {}
): ReturnType<typeof render> {
  return render(<TestEchoProvider {...options}>{component}</TestEchoProvider>);
}

/**
 * Mock UserManager for testing specific OAuth scenarios
 */
export function createMockUserManager(
  overrides: Partial<Record<string, unknown>> = {}
) {
  return {
    signinRedirect: vi.fn().mockResolvedValue(undefined),
    signinCallback: vi.fn().mockResolvedValue(undefined),
    signinRedirectCallback: vi.fn().mockResolvedValue({
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      profile: {
        sub: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
    }),
    signinSilent: vi.fn().mockResolvedValue({
      access_token: 'mock-renewed-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      profile: {
        sub: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
    }),
    signinSilentCallback: vi.fn().mockResolvedValue(undefined),
    getUser: vi.fn().mockResolvedValue(null),
    removeUser: vi.fn().mockResolvedValue(undefined),
    signoutRedirect: vi.fn().mockResolvedValue(undefined),
    signoutCallback: vi.fn().mockResolvedValue(undefined),
    events: {
      addUserLoaded: vi.fn(),
      addUserUnloaded: vi.fn(),
      addAccessTokenExpiring: vi.fn(),
      addAccessTokenExpired: vi.fn(),
      addSilentRenewError: vi.fn(),
      addUserSignedIn: vi.fn(),
      addUserSignedOut: vi.fn(),
      addUserSessionChanged: vi.fn(),
      removeUserLoaded: vi.fn(),
      removeUserUnloaded: vi.fn(),
      removeAccessTokenExpiring: vi.fn(),
      removeAccessTokenExpired: vi.fn(),
      removeSilentRenewError: vi.fn(),
      removeUserSignedIn: vi.fn(),
      removeUserSignedOut: vi.fn(),
      removeUserSessionChanged: vi.fn(),
      load: vi.fn(),
      unload: vi.fn(),
    },
    ...overrides,
  };
}

/**
 * Mock authenticated user for testing
 */
export async function createMockAuthenticatedUser(
  overrides: {
    profile?: Record<string, unknown>;
    [key: string]: unknown;
  } = {}
) {
  // Create a valid JWT token for API calls
  const { createValidJWT } = await import('../mocks/jwt-factory');
  const validToken = await createValidJWT({
    userId: 'test-user-123',
    appId: 'test-app-456',
    scope: 'llm:invoke offline_access',
  });

  const defaultProfile = {
    sub: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  return {
    access_token: validToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token',
    scope: 'llm:invoke offline_access',
    expired: false,
    profile: {
      ...defaultProfile,
      ...(overrides.profile || {}),
    },
    ...overrides,
  };
}

/**
 * Create a mock authenticated user that simulates the real OIDC flow
 * where the userinfo endpoint provides clean data regardless of initial OAuth profile
 */
export async function createMockAuthenticatedUserWithUserInfo(
  initialOAuthProfile: Record<string, unknown> = {},
  tokenOverrides: Record<string, unknown> = {}
) {
  const validToken = await (
    await import('../mocks/jwt-factory')
  ).createValidJWT({
    userId: 'test-user-123',
    appId: 'test-app-456',
    scope: 'llm:invoke offline_access',
  });

  // This simulates the real OIDC flow:
  // 1. Initial OAuth profile might contain malicious data
  // 2. But with loadUserInfo: true, the OIDC library calls /oauth/userinfo
  // 3. The userinfo endpoint returns clean data that overwrites the profile

  // The final profile will contain the clean data from the userinfo endpoint
  // (this simulates what oidc-client-ts does when loadUserInfo: true)
  const cleanProfileFromUserInfo = {
    sub: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    preferred_username: 'testuser',
    given_name: 'Test',
    family_name: 'User',
    picture: 'https://example.com/avatar.jpg',
    email_verified: true,
  };

  return {
    access_token: validToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token',
    scope: 'llm:invoke offline_access',
    expired: false,
    // The profile contains clean data from userinfo endpoint, not the initial OAuth data
    profile: cleanProfileFromUserInfo,
    // Store the initial malicious OAuth data for reference (but it's not used)
    _initialOAuthProfile: initialOAuthProfile,
    ...tokenOverrides,
  };
}

/**
 * Simulate OAuth callback URL parameters
 */
export function mockOAuthCallback(params: {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  // Generate state if not provided
  const state = params.state || `oidc_state_${Date.now()}`;
  if (!params.state) {
    searchParams.set('state', state);
  }

  // Mock sessionStorage for oidc-client-ts state handling with correct format
  sessionStorage.setItem(
    `oidc.${state}`,
    JSON.stringify({
      id: state,
      data: {
        state,
        code_verifier: 'test-code-verifier-123456',
        code_challenge: 'test-code-challenge',
        code_challenge_method: 'S256',
        client_id: 'test-app-id',
        redirect_uri: 'http://localhost:3000/callback',
        scope: 'llm:invoke offline_access',
        response_type: 'code',
        created: Date.now(),
      },
      created: Date.now(),
    })
  );

  // Mock window.location.search
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      search: `?${searchParams.toString()}`,
      hash: '',
    },
    writable: true,
  });
}

/**
 * Reset URL to clean state (no query parameters)
 */
export function resetUrl() {
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      search: '',
      pathname: '/',
      href: 'http://localhost:3000/',
    },
    writable: true,
  });
}

/**
 * Test utility to verify tokens are not in accessible storage
 */
export function expectTokensNotInStorage() {
  const localStorage = window.localStorage;
  const sessionStorage = window.sessionStorage;

  // Check that no JWT-like strings are stored
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      expect(value).not.toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
      );
    }
  }

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const value = sessionStorage.getItem(key);
      expect(value).not.toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
      );
    }
  }
}
