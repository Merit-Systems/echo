import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { TEST_CONFIG, TEST_CLIENT_IDS } from '../../config';

// Import the actual React SDK components
import { EchoProvider, useEcho } from '@echo-systems/react-sdk';
import type { EchoConfig } from '@echo-systems/react-sdk';

// Test component that uses the useEcho hook
function TestEchoComponent() {
  const { user, balance, isAuthenticated, isLoading, error } = useEcho();

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (error) {
    return <div data-testid="error">{error}</div>;
  }

  return (
    <div data-testid="echo-status">
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && (
        <div data-testid="user-info">
          <span data-testid="user-id">{user.id}</span>
          <span data-testid="user-email">{user.email}</span>
        </div>
      )}
      {balance && (
        <div data-testid="balance-info">
          <span data-testid="credits">{balance.credits}</span>
        </div>
      )}
    </div>
  );
}

describe('React SDK Integration Tests', () => {
  let originalLocation: Location;

  beforeEach(() => {
    // Mock window.location for OAuth redirects
    originalLocation = window.location;
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      href: 'http://localhost:3000',
      search: '',
      origin: 'http://localhost:3000',
      pathname: '/',
    } as Location;

    // Clear any existing UserManager instances
    if ((window as any).__echoUserManager) {
      delete (window as any).__echoUserManager;
    }
  });

  afterEach(() => {
    // Restore original location
    window.location = originalLocation;

    // Clean up UserManager
    if ((window as any).__echoUserManager) {
      delete (window as any).__echoUserManager;
    }
  });

  test('EchoProvider renders and initializes with real echo-control configuration', async () => {
    console.log('🔧 Testing EchoProvider with real echo-control API...');

    const config: EchoConfig = {
      instanceId: TEST_CLIENT_IDS.primary,
      apiUrl: TEST_CONFIG.services.echoControl,
      redirectUri: 'http://localhost:3000/callback',
      scope: 'llm:invoke offline_access',
    };

    render(
      <EchoProvider config={config}>
        <TestEchoComponent />
      </EchoProvider>
    );

    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for initialization to complete
    await waitFor(
      () => {
        expect(screen.getByTestId('echo-status')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Should show not authenticated (no user session)
    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );

    // Verify UserManager was created with real echo-control URLs
    const userManager = (window as any).__echoUserManager;
    expect(userManager).toBeDefined();
    expect(userManager.settings.authority).toBe(
      TEST_CONFIG.services.echoControl
    );
    expect(userManager.settings.client_id).toBe(TEST_CLIENT_IDS.primary);

    console.log('✅ EchoProvider integration test passed');
  });

  test('useEcho hook provides correct interface and functions', async () => {
    console.log('🔧 Testing useEcho hook with real configuration...');

    const config: EchoConfig = {
      instanceId: TEST_CLIENT_IDS.primary,
      apiUrl: TEST_CONFIG.services.echoControl,
    };

    // Test component that exposes hook values for testing
    function HookTestComponent() {
      const echo = useEcho();

      return (
        <div data-testid="hook-test">
          <div data-testid="has-signin">
            {typeof echo.signIn === 'function' ? 'true' : 'false'}
          </div>
          <div data-testid="has-signout">
            {typeof echo.signOut === 'function' ? 'true' : 'false'}
          </div>
          <div data-testid="has-refresh">
            {typeof echo.refreshBalance === 'function' ? 'true' : 'false'}
          </div>
          <div data-testid="has-payment">
            {typeof echo.createPaymentLink === 'function' ? 'true' : 'false'}
          </div>
          <div data-testid="loading-state">{echo.isLoading.toString()}</div>
          <div data-testid="auth-state">{echo.isAuthenticated.toString()}</div>
        </div>
      );
    }

    render(
      <EchoProvider config={config}>
        <HookTestComponent />
      </EchoProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('hook-test')).toBeInTheDocument();
    });

    // Verify all expected hook functions are available
    expect(screen.getByTestId('has-signin')).toHaveTextContent('true');
    expect(screen.getByTestId('has-signout')).toHaveTextContent('true');
    expect(screen.getByTestId('has-refresh')).toHaveTextContent('true');
    expect(screen.getByTestId('has-payment')).toHaveTextContent('true');

    // Verify state properties exist
    expect(screen.getByTestId('loading-state')).toHaveTextContent(/true|false/);
    expect(screen.getByTestId('auth-state')).toHaveTextContent('false'); // Not authenticated initially

    console.log('✅ useEcho hook interface test passed');
  });
});
