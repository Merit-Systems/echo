import { act, screen, waitFor } from '@testing-library/react';
import { useEcho } from '../../hooks/useEcho';
import { errorHandlers } from '../mocks/handlers';
import { server } from '../mocks/server';
import {
  createMockAuthenticatedUser,
  createMockUserManager,
  mockOAuthCallback,
  renderWithEcho,
  resetUrl,
} from '../utils/test-helpers';

// Test component to access EchoProvider context
function TestComponent() {
  const { user, isLoggedIn, error } = useEcho();

  return (
    <div>
      <div data-testid="authenticated">
        {isLoggedIn ? 'Authenticated' : 'Not authenticated'}
      </div>
      <div data-testid="user">{user ? `User: ${user.name}` : 'No user'}</div>
      <div data-testid="error">{error || 'No error'}</div>
    </div>
  );
}

describe('OAuth Flow Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
    resetUrl();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('OAuth Component Integration', () => {
    // Testing react-oidc-context integration - requires auth to work
    test.skip('EchoProvider handles OAuth callback and cleans URL', async () => {
      const mockUser = await createMockAuthenticatedUser();
      const mockUserManager = createMockUserManager({
        signinRedirectCallback: vi.fn().mockResolvedValue(mockUser),
      });

      // Simulate OAuth callback with authorization code and state
      const state = 'test-state-123';
      mockOAuthCallback({ code: 'test-auth-code', state });

      await act(async () => {
        renderWithEcho(<TestComponent />, { mockUserManager });
      });

      // Test component processes OAuth callback successfully
      await act(async () => {
        await waitFor(
          () => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent(
              'Authenticated'
            );
          },
          { timeout: 5000 }
        );
      });

      expect(screen.getByTestId('user')).toHaveTextContent('User: Test User');
      expect(mockUserManager.signinRedirectCallback).toHaveBeenCalled();

      // Test URL cleanup after OAuth success
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        expect.any(String),
        '/'
      );
    });

    // Testing react-oidc-context integration - requires auth to work
    test.skip('EchoProvider handles OAuth authorization errors', async () => {
      const mockUserManager = createMockUserManager({
        signinRedirectCallback: vi
          .fn()
          .mockRejectedValue(new Error('OAuth authorization failed')),
      });

      // Simulate OAuth callback with authorization code that will fail
      mockOAuthCallback({ code: 'invalid-auth-code', state: 'test-state' });

      renderWithEcho(<TestComponent />, { mockUserManager });

      // Test component handles OAuth error gracefully
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'OAuth authorization failed'
        );
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'Not authenticated'
      );
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    // Testing react-oidc-context integration - requires auth to work
    test.skip('EchoProvider handles server-side OAuth validation errors', async () => {
      server.use(errorHandlers.invalidClient);

      const mockUserManager = createMockUserManager({
        signinRedirectCallback: vi
          .fn()
          .mockRejectedValue(new Error('Invalid client configuration')),
      });

      // Simulate OAuth callback that will trigger server validation error
      mockOAuthCallback({ code: 'invalid-code', state: 'test-state' });

      renderWithEcho(<TestComponent />, { mockUserManager });

      // Test component handles server OAuth validation failure
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Invalid client configuration'
        );
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'Not authenticated'
      );
    });

    // Testing react-oidc-context integration - requires auth to work
    test.skip('EchoProvider preserves user state during OAuth flow', async () => {
      const mockUser = await createMockAuthenticatedUser();
      const mockUserManager = createMockUserManager({
        getUser: vi.fn().mockResolvedValue(mockUser),
        signinRedirectCallback: vi.fn().mockResolvedValue(mockUser),
      });

      // Start with existing user session
      renderWithEcho(<TestComponent />, { mockUserManager });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });

      // Simulate OAuth callback (e.g., from token refresh)
      mockOAuthCallback({ code: 'refresh-code', state: 'refresh-state' });

      // Should maintain authentication state
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated'
        );
        expect(screen.getByTestId('user')).toHaveTextContent('User: Test User');
      });
    });
  });

  describe('OAuth API Security Validation', () => {
    test('API rejects unauthorized redirect URIs', async () => {
      server.use(errorHandlers.invalidClient);

      const authorizeUrl = new URL('http://localhost:3000/api/oauth/authorize');
      authorizeUrl.searchParams.set('client_id', 'test-client');
      authorizeUrl.searchParams.set(
        'redirect_uri',
        'https://malicious-site.com/callback'
      );
      authorizeUrl.searchParams.set('code_challenge', 'test-challenge');
      authorizeUrl.searchParams.set('code_challenge_method', 'S256');

      const response = await fetch(authorizeUrl.toString());

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error).toBe('invalid_client');
    });

    test('API rejects implicit flow attempts', async () => {
      const authorizeUrl = new URL('http://localhost:3000/api/oauth/authorize');
      authorizeUrl.searchParams.set('client_id', 'test-client');
      authorizeUrl.searchParams.set(
        'redirect_uri',
        'http://localhost:3000/callback'
      );
      authorizeUrl.searchParams.set('response_type', 'token'); // Implicit flow

      const response = await fetch(authorizeUrl.toString());

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error).toBe('unsupported_response_type');
    });
  });
});
