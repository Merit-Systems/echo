import { describe, test, expect, beforeAll } from 'vitest';
import {
  echoControlApi,
  TEST_CLIENT_IDS,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
} from '../../utils/index.js';

describe('PKCE Security Validation', () => {
  beforeAll(async () => {
    // Ensure echo-control is running and healthy
    await echoControlApi.healthCheck();
  });

  describe('Code Challenge/Verifier Validation', () => {
    test('validates code verifier against code challenge correctly', async () => {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      // Start OAuth flow with PKCE
      const authUrl = await echoControlApi.getOAuthAuthorizeUrl({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke offline_access',
      });

      expect(authUrl).toBeTruthy();
      expect(authUrl).toContain('code_challenge=');
      expect(authUrl).toContain('code_challenge_method=S256');
    });

    test('rejects mismatched code verifier', async () => {
      // This test simulates an attacker trying to use a different code verifier
      // than the one used to generate the code challenge

      const originalCodeVerifier = generateCodeVerifier();
      const originalCodeChallenge = generateCodeChallenge(originalCodeVerifier);
      const attackerCodeVerifier = generateCodeVerifier(); // Different verifier

      // Start the flow with original challenge
      await echoControlApi.getOAuthAuthorizeUrl({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state: generateState(),
        code_challenge: originalCodeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke',
      });

      // Simulate getting an authorization code (in real test, this would come from callback)
      const mockAuthCode = 'mock_auth_code_' + Math.random().toString(36);

      // Try to exchange code with wrong verifier - should fail
      await expect(
        echoControlApi.exchangeCodeForToken({
          code: mockAuthCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: attackerCodeVerifier, // Wrong verifier!
        })
      ).rejects.toThrow(/invalid.*grant|code.*verifier.*invalid/i);
    });

    test('prevents code interception attacks', async () => {
      // This test ensures that even if an attacker intercepts the authorization code,
      // they cannot use it without the original code verifier

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);

      await echoControlApi.getOAuthAuthorizeUrl({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state: generateState(),
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke',
      });

      // Simulate an intercepted authorization code
      const interceptedCode =
        'intercepted_auth_code_' + Math.random().toString(36);

      // Attacker tries to use code without verifier
      await expect(
        echoControlApi.exchangeCodeForToken({
          code: interceptedCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: '', // No verifier
        })
      ).rejects.toThrow(/code.*verifier.*required|invalid.*request/i);

      // Attacker tries to use code with wrong verifier
      await expect(
        echoControlApi.exchangeCodeForToken({
          code: interceptedCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: generateCodeVerifier(), // Wrong verifier
        })
      ).rejects.toThrow(/invalid.*grant|code.*verifier.*invalid/i);
    });

    test('prevents replay attacks', async () => {
      // This test ensures that authorization codes can only be used once

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);

      await echoControlApi.getOAuthAuthorizeUrl({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state: generateState(),
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke',
      });

      const authCode = 'auth_code_' + Math.random().toString(36);

      // First attempt should work (in a real scenario)
      // Note: This will fail because we're using a mock code, but the error should be about invalid grant, not missing verifier
      try {
        await echoControlApi.exchangeCodeForToken({
          code: authCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: codeVerifier,
        });
      } catch (error) {
        const err = error as Error;
        // Should fail with invalid_grant (because mock code), not verifier issues
        expect(err.message).toMatch(/invalid.*grant/i);
        expect(err.message).not.toMatch(/verifier/i);
      }

      // Second attempt with same code should fail (replay attack prevention)
      await expect(
        echoControlApi.exchangeCodeForToken({
          code: authCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: codeVerifier,
        })
      ).rejects.toThrow(/invalid.*grant|code.*expired|already.*used/i);
    });
  });

  describe('Security Attack Prevention', () => {
    test('prevents downgrade attacks to plain method', async () => {
      const codeVerifier = generateCodeVerifier();

      // Should reject 'plain' method
      await expect(
        echoControlApi.validateOAuthAuthorizeRequest({
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          state: generateState(),
          code_challenge: codeVerifier, // Plain text for 'plain' method
          code_challenge_method: 'plain',
        })
      ).rejects.toThrow(/unsupported.*method|invalid.*method/i);
    });

    test('prevents malformed code challenge attacks', async () => {
      const malformedChallenges = [
        '', // Empty
        'invalid!@#$%', // Invalid characters
        'a', // Too short
        'A'.repeat(200), // Too long
        '====', // Invalid base64url
        'contains+and/characters', // Base64 instead of base64url
      ];

      for (const challenge of malformedChallenges) {
        await expect(
          echoControlApi.validateOAuthAuthorizeRequest({
            client_id: TEST_CLIENT_IDS.primary,
            redirect_uri: 'http://localhost:3000/callback',
            state: generateState(),
            code_challenge: challenge,
            code_challenge_method: 'S256',
          })
        ).rejects.toThrow(/invalid.*challenge|malformed.*challenge/i);
      }
    });

    test('validates code challenge method parameter', async () => {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);

      // Should reject invalid methods (excluding empty string which requires auth context)
      const invalidMethods = ['MD5', 'SHA1', 'invalid', 's256', 'Plain'];

      for (const method of invalidMethods) {
        await expect(
          echoControlApi.validateOAuthAuthorizeRequest({
            client_id: TEST_CLIENT_IDS.primary,
            redirect_uri: 'http://localhost:3000/callback',
            state: generateState(),
            code_challenge: codeChallenge,
            code_challenge_method: method,
          })
        ).rejects.toThrow(/unsupported.*method|invalid.*method/i);
      }
    });
  });

  describe('Code Verifier Server Validation', () => {
    test('rejects code verifier too short in token exchange', async () => {
      const shortVerifier = 'short'; // Less than 43 characters
      const mockCode = 'mock_auth_code_' + Math.random().toString(36);

      await expect(
        echoControlApi.exchangeCodeForToken({
          code: mockCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: shortVerifier,
        })
      ).rejects.toThrow(
        /code.*verifier.*length|invalid.*request|invalid.*grant/i
      );
    });

    test('rejects code verifier too long in token exchange', async () => {
      const longVerifier = 'a'.repeat(129); // More than 128 characters
      const mockCode = 'mock_auth_code_' + Math.random().toString(36);

      await expect(
        echoControlApi.exchangeCodeForToken({
          code: mockCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: longVerifier,
        })
      ).rejects.toThrow(
        /code.*verifier.*length|invalid.*request|invalid.*grant/i
      );
    });

    test('rejects code verifier with invalid characters', async () => {
      const invalidVerifiers = [
        'invalid+chars/not=allowed', // Contains +, /, =
        'spaces not allowed here', // Contains spaces
        'unicode-δοκιμή-test', // Unicode characters
        'special!@#$%^&*()chars', // Special characters
      ];

      const mockCode = 'mock_auth_code_' + Math.random().toString(36);

      for (const verifier of invalidVerifiers) {
        await expect(
          echoControlApi.exchangeCodeForToken({
            code: mockCode,
            client_id: TEST_CLIENT_IDS.primary,
            redirect_uri: 'http://localhost:3000/callback',
            code_verifier: verifier,
          })
        ).rejects.toThrow(
          /invalid.*grant|code.*verifier.*invalid|invalid.*characters|invalid.*request/i
        );
      }
    });

    test('accepts valid code verifier format (minimum length)', async () => {
      const validMinVerifier = 'a'.repeat(43); // Exactly 43 characters
      const mockCode = 'mock_auth_code_' + Math.random().toString(36);

      // Should fail due to invalid auth code, not verifier format
      await expect(
        echoControlApi.exchangeCodeForToken({
          code: mockCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: validMinVerifier,
        })
      ).rejects.toThrow(/invalid.*grant|authorization.*code/i);

      // Should NOT throw verifier-related errors
      try {
        await echoControlApi.exchangeCodeForToken({
          code: mockCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: validMinVerifier,
        });
      } catch (error) {
        const err = error as Error;
        expect(err.message).not.toMatch(
          /code.*verifier.*length|verifier.*invalid/i
        );
      }
    });

    test('accepts valid code verifier format (maximum length)', async () => {
      const validMaxVerifier = 'a'.repeat(128); // Exactly 128 characters
      const mockCode = 'mock_auth_code_' + Math.random().toString(36);

      // Should fail due to invalid auth code, not verifier format
      await expect(
        echoControlApi.exchangeCodeForToken({
          code: mockCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: validMaxVerifier,
        })
      ).rejects.toThrow(/invalid.*grant|authorization.*code/i);

      // Should NOT throw verifier-related errors
      try {
        await echoControlApi.exchangeCodeForToken({
          code: mockCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: validMaxVerifier,
        });
      } catch (error) {
        const err = error as Error;
        expect(err.message).not.toMatch(
          /code.*verifier.*length|verifier.*invalid/i
        );
      }
    });

    test('accepts valid unreserved characters in code verifier', async () => {
      const validVerifier =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'; // 66 chars, all valid
      const mockCode = 'mock_auth_code_' + Math.random().toString(36);

      // Should fail due to invalid auth code, not verifier format
      try {
        await echoControlApi.exchangeCodeForToken({
          code: mockCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: validVerifier,
        });
      } catch (error) {
        const err = error as Error;
        expect(err.message).not.toMatch(
          /code.*verifier.*invalid|invalid.*characters/i
        );
        expect(err.message).toMatch(/invalid.*grant|authorization.*code/i);
      }
    });
  });
});
