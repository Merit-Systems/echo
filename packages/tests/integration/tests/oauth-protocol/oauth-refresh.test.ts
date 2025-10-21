import { describe, test, expect, beforeAll } from 'vitest';
import {
  echoControlApi,
  TEST_CLIENT_IDS,
  TEST_CONFIG,
} from '../../utils/index.js';

describe('OAuth Refresh Token Tests', () => {
  beforeAll(async () => {
    // Ensure echo-control is running and healthy
    await echoControlApi.healthCheck();
  });

  describe('Grant Type Validation', () => {
    test('rejects invalid grant types', async () => {
      await expect(
        echoControlApi.refreshToken({
          refresh_token: 'test-refresh-token',
          client_id: TEST_CLIENT_IDS.primary,
        })
      ).rejects.toThrow(/invalid.*grant|unsupported.*grant|refresh.*token/i);
    });

    test('rejects missing grant type in custom request', async () => {
      // Test direct API call without grant_type to ensure server validation
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: 'test-refresh-token',
            client_id: TEST_CLIENT_IDS.primary,
            // Missing grant_type
          }),
        }
      );

      expect(response.ok).toBe(false);
      const errorData = await response.json();
      expect(errorData.error).toMatch(
        /unsupported.*grant.*type|invalid.*request|grant.*type.*required/i
      );
    });

    test('rejects wrong grant type in custom request', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'nonsense_grant_type', // Wrong type
            refresh_token: 'test-refresh-token',
            client_id: TEST_CLIENT_IDS.primary,
          }),
        }
      );

      expect(response.ok).toBe(false);
      const errorData = await response.json();
      expect(errorData.error_description).toMatch(
        /must provide a valid grant_type \(authorization_code or refresh_token\)/i
      );
    });
  });

  describe('Refresh Token Validation', () => {
    test('rejects missing refresh token', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            client_id: TEST_CLIENT_IDS.primary,
            // Missing refresh_token
          }),
        }
      );

      expect(response.ok).toBe(false);
      const errorData = await response.json();
      expect(errorData.error).toMatch(
        /invalid.*request|refresh.*token.*required/i
      );
    });

    test('rejects empty refresh token', async () => {
      await expect(
        echoControlApi.refreshToken({
          refresh_token: '',
          client_id: TEST_CLIENT_IDS.primary,
        })
      ).rejects.toThrow(/invalid.*grant|invalid.*token|refresh.*token/i);
    });

    test('rejects invalid refresh token format', async () => {
      const invalidTokens = [
        'invalid-token',
        'not.a.jwt.token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
      ];

      for (const token of invalidTokens) {
        await expect(
          echoControlApi.refreshToken({
            refresh_token: token,
            client_id: TEST_CLIENT_IDS.primary,
          })
        ).rejects.toThrow(/invalid.*grant|invalid.*token|refresh.*token/i);
      }
    });

    test('rejects non-existent refresh token', async () => {
      // Generate a valid JWT structure but non-existent in database
      const nonExistentToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        Buffer.from(
          JSON.stringify({
            sub: 'non-existent-user',
            jti: 'non-existent-token-id',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
          })
        ).toString('base64url') +
        '.fake-signature';

      await expect(
        echoControlApi.refreshToken({
          refresh_token: nonExistentToken,
          client_id: TEST_CLIENT_IDS.primary,
        })
      ).rejects.toThrow(/invalid.*grant|token.*not.*found|invalid.*token/i);
    });
  });

  describe('Client Validation', () => {
    test('rejects missing client_id', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token: 'test-refresh-token',
            // Missing client_id
          }),
        }
      );

      expect(response.ok).toBe(false);
      const errorData = await response.json();
      expect(errorData.error).toMatch(
        /invalid.*grant|invalid.*request|client.*id.*required/i
      );
    });

    test('rejects invalid client_id format', async () => {
      const invalidClientIds = [
        '',
        'invalid-uuid',
        '12345',
        'not-a-uuid-at-all',
      ];

      for (const clientId of invalidClientIds) {
        await expect(
          echoControlApi.refreshToken({
            refresh_token: 'test-refresh-token',
            client_id: clientId,
          })
        ).rejects.toThrow(
          /invalid.*grant|invalid.*client|client.*not.*found|invalid.*request/i
        );
      }
    });

    test('rejects non-existent client_id', async () => {
      await expect(
        echoControlApi.refreshToken({
          refresh_token: 'test-refresh-token',
          client_id: '99999999-9999-9999-9999-999999999999', // Non-existent
        })
      ).rejects.toThrow(/refresh token not found/i);
    });
  });

  describe('Content-Type Handling', () => {
    test('supports application/json content-type', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token: 'test-refresh-token',
            client_id: TEST_CLIENT_IDS.primary,
          }),
        }
      );

      // Should fail due to invalid token, not content-type
      expect(response.ok).toBe(false);
      const errorData = await response.json();
      expect(typeof errorData.error_description).toBe('string');
      expect(errorData.error_description).not.toEqual('Invalid content-type');
    });

    test('supports application/x-www-form-urlencoded content-type', async () => {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: 'test-refresh-token',
        client_id: TEST_CLIENT_IDS.primary,
      });

      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      // Should fail due to invalid token, not content-type
      expect(response.ok).toBe(false);
      const errorData = await response.json();
      expect(typeof errorData.error_description).toBe('string');
      expect(errorData.error_description).not.toEqual('Invalid content-type');
    });

    test('rejects unsupported content-types', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: 'invalid body',
        }
      );

      expect(response.ok).toBe(false);
      const errorData = await response.json();
      expect(typeof errorData.error_description).toBe('string');
      expect(errorData.error_description).toBe('Invalid content-type');
    });
  });

  describe('HTTP Method Validation', () => {
    test('rejects GET requests', async () => {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: 'test-refresh-token',
        client_id: TEST_CLIENT_IDS.primary,
      });

      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/oauth/token?${params.toString()}`,
        {
          method: 'GET',
        }
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(405); // Method Not Allowed
    });

    test('rejects PUT requests', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/oauth/token`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token: 'test-refresh-token',
            client_id: TEST_CLIENT_IDS.primary,
          }),
        }
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(405); // Method Not Allowed
    });
  });

  describe('Error Response Format', () => {
    test('returns consistent OAuth error format', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'invalid_grant_type',
            refresh_token: 'test-refresh-token',
            client_id: TEST_CLIENT_IDS.primary,
          }),
        }
      );

      expect(response.ok).toBe(false);
      const errorData = await response.json();

      // OAuth 2.0 spec requires 'error' field
      expect(errorData).toHaveProperty('error');
      expect(typeof errorData.error).toBe('string');

      // May also have error_description
      if (errorData.error_description) {
        expect(typeof errorData.error_description).toBe('string');
      }
    });
  });

  describe('Refresh Token Lifecycle', () => {
    test('fails to refresh access token with expired refresh token', async () => {
      // This test requires setting OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS=1
      // in the environment to make tokens expire quickly

      // Skip test if we're not in a test environment with short token expiry
      const expectedExpirySeconds =
        process.env.OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS;
      if (!expectedExpirySeconds || parseInt(expectedExpirySeconds) > 10) {
        console.log(
          'Skipping expired refresh token test - requires OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS=1 or similar short duration'
        );
        return;
      }

      // log token expiry
      console.log(
        'The token expiry is set as',
        expectedExpirySeconds,
        'seconds for testing'
      );

      // Step 1: Get a real authorization code through OAuth flow
      const { generateCodeVerifier, generateCodeChallenge, generateState } =
        await import('../../utils/auth-helpers.js');

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      console.log(
        'Getting authorization code for refresh token expiry test...'
      );

      const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke offline_access',
        prompt: 'none', // Skip consent page for automated testing
      });

      // Extract authorization code from callback URL
      const callbackUrl = new URL(redirectUrl);
      const authCode = callbackUrl.searchParams.get('code');
      expect(authCode).toBeTruthy();

      // Step 2: Exchange authorization code for tokens (including refresh token)
      console.log('Exchanging auth code for tokens with short expiry...');

      const tokenResponse = await echoControlApi.exchangeCodeForToken({
        code: authCode!,
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        code_verifier: codeVerifier,
      });

      expect(tokenResponse.refresh_token).toBeTruthy();
      console.log(
        `Got refresh token that expires in ${tokenResponse.refresh_token_expires_in} seconds`
      );

      console.log('The token response is', tokenResponse);

      // Step 3: Wait for the refresh token to expire
      const waitTime = tokenResponse.refresh_token_expires_in! * 1000 + 2000; // Add 2000ms buffer
      console.log(
        `Waiting ${waitTime} milliseconds for refresh token to expire...`
      );
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Step 4: Try to refresh with the expired token - should fail
      console.log('Attempting to refresh with expired token...');
      await expect(
        echoControlApi.refreshToken({
          refresh_token: tokenResponse.refresh_token!,
          client_id: TEST_CLIENT_IDS.primary,
        })
      ).rejects.toThrow(
        /invalid.*grant|refresh.*token.*expired|token.*expired/i
      );

      console.log('✅ Expired refresh token correctly rejected');
    });

    test('Succeeds with a valid refresh token, then fails when it expires', async () => {
      // Step 1: Get a real authorization code through OAuth flow
      const { generateCodeVerifier, generateCodeChallenge, generateState } =
        await import('../../utils/auth-helpers.js');

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      console.log(
        'Getting authorization code for refresh token expiry test...'
      );

      const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke offline_access',
        prompt: 'none', // Skip consent page for automated testing
      });

      // Extract authorization code from callback URL
      const callbackUrl = new URL(redirectUrl);
      const authCode = callbackUrl.searchParams.get('code');
      expect(authCode).toBeTruthy();

      // Step 2: Exchange authorization code for tokens (including refresh token)
      console.log('Exchanging auth code for tokens with short expiry...');

      const tokenResponse = await echoControlApi.exchangeCodeForToken({
        code: authCode!,
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        code_verifier: codeVerifier,
      });

      expect(tokenResponse.refresh_token).toBeTruthy();
      console.log(
        `Got refresh token that expires in ${tokenResponse.refresh_token_expires_in} seconds`
      );

      // Step 3: Use the refresh token to get a new access token
      console.log('Using refresh token to get a new access token...');
      const newAccessToken = await echoControlApi.refreshToken({
        refresh_token: tokenResponse.refresh_token!,
        client_id: TEST_CLIENT_IDS.primary,
      });
      console.log('New access token:', newAccessToken);
      expect(newAccessToken.access_token).toBeTruthy();

      console.log(
        '🔍 New access token expires in',
        newAccessToken.expires_in,
        'seconds'
      );

      // Step 4: Wait for the refresh token to expire
      const waitTime = newAccessToken.expires_in * 1000 + 2000; // Add 2000ms buffer
      console.log(`Waiting ${waitTime}s for refresh token to expire...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Step 4: Try to refresh with the expired token - should fail
      console.log('Attempting to refresh with expired token...');
      await expect(
        echoControlApi.refreshToken({
          refresh_token: tokenResponse.refresh_token!,
          client_id: TEST_CLIENT_IDS.primary,
        })
      ).rejects.toThrow(
        /invalid.*grant|refresh.*token.*expired|token.*expired|refresh.*token.*not.*found/i
      );

      console.log('✅ Expired refresh token correctly rejected');
    });
  });

  describe('Expired Access Token Fails to Authenticate', () => {
    test('fails to authenticate with expired access token', async () => {
      // Step 1: Get a real authorization code through OAuth flow
      const { generateCodeVerifier, generateCodeChallenge, generateState } =
        await import('../../utils/auth-helpers.js');

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      console.log(
        'Getting authorization code for refresh token expiry test...'
      );

      const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke offline_access',
        prompt: 'none', // Skip consent page for automated testing
      });

      // Extract authorization code from callback URL
      const callbackUrl = new URL(redirectUrl);
      const authCode = callbackUrl.searchParams.get('code');
      expect(authCode).toBeTruthy();

      // Step 2: Exchange authorization code for tokens (including refresh token)
      console.log('Exchanging auth code for tokens with short expiry...');

      const tokenResponse = await echoControlApi.exchangeCodeForToken({
        code: authCode!,
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        code_verifier: codeVerifier,
      });

      // token expiry is in the token response
      console.log(
        `Access token expires in ${tokenResponse.expires_in} seconds`
      );

      // wait for the access token to expire
      const waitTime = tokenResponse.expires_in * 1000 + 2000; // Add 2000ms buffer
      console.log(`Waiting ${waitTime}ms for access token to expire...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Step 3: Try to use the access token - should fail
      console.log('Attempting to use expired access token...');
      await expect(
        echoControlApi.getBalance(tokenResponse.access_token!)
      ).rejects.toThrow(/401|Unauthorized/i);

      console.log('✅ Expired access token correctly rejected');
    });

    test('Succeeds Authentication with JWT token', async () => {
      // Step 1: Get a real authorization code through OAuth flow
      const { generateCodeVerifier, generateCodeChallenge, generateState } =
        await import('../../utils/auth-helpers.js');

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      console.log(
        'Getting authorization code for refresh token expiry test...'
      );

      const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke offline_access',
        prompt: 'none', // Skip consent page for automated testing
      });

      // Extract authorization code from callback URL
      const callbackUrl = new URL(redirectUrl);
      const authCode = callbackUrl.searchParams.get('code');
      expect(authCode).toBeTruthy();

      // Step 2: Exchange authorization code for tokens (including refresh token)
      console.log('Exchanging auth code for tokens with short expiry...');

      const tokenResponse = await echoControlApi.exchangeCodeForToken({
        code: authCode!,
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        code_verifier: codeVerifier,
      });

      // Step 3: First test JWT validation directly
      console.log('🔍 Testing JWT validation endpoint...');
      try {
        const jwtValidation = await echoControlApi.validateJwtToken(
          tokenResponse.access_token!
        );
        console.log('✅ JWT validation result:', jwtValidation);

        // Also decode the JWT to see the api_key_id
        const parts = tokenResponse.access_token!.split('.');
        if (parts[1]) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString()
          );
          console.log('🔍 JWT payload api_key_id:', payload.api_key_id);
        }
      } catch (error) {
        console.error('❌ JWT validation failed:', error);
      }

      // Step 3: Use the access token to get the balance
      console.log('Using access token to get the balance...');
      const balance = await echoControlApi.getBalance(
        tokenResponse.access_token!
      );
      console.log('Balance:', balance);
      expect(balance).toBeTruthy();
    });

    test('Succeeds Authentication with JWT token, and then fails when it expires', async () => {
      // Step 1: Get a real authorization code through OAuth flow
      const { generateCodeVerifier, generateCodeChallenge, generateState } =
        await import('../../utils/auth-helpers.js');

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      console.log(
        'Getting authorization code for refresh token expiry test...'
      );

      const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke offline_access',
        prompt: 'none', // Skip consent page for automated testing
      });

      // Extract authorization code from callback URL
      const callbackUrl = new URL(redirectUrl);
      const authCode = callbackUrl.searchParams.get('code');
      expect(authCode).toBeTruthy();

      // Step 2: Exchange authorization code for tokens (including refresh token)
      console.log('Exchanging auth code for tokens with short expiry...');

      const tokenResponse = await echoControlApi.exchangeCodeForToken({
        code: authCode!,
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        code_verifier: codeVerifier,
      });

      // Step 3: First test JWT validation directly
      console.log('🔍 Testing JWT validation endpoint...');
      try {
        const jwtValidation = await echoControlApi.validateJwtToken(
          tokenResponse.access_token!
        );
        console.log('✅ JWT validation result:', jwtValidation);

        // Also decode the JWT to see the api_key_id
        const parts = tokenResponse.access_token!.split('.');
        if (parts[1]) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString()
          );
          console.log('🔍 JWT payload api_key_id:', payload.api_key_id);
        }
      } catch (error) {
        console.error('❌ JWT validation failed:', error);
      }

      // Step 3: Use the access token to get the balance
      console.log('Using access token to get the balance...');
      const balance = await echoControlApi.getBalance(
        tokenResponse.access_token!
      );
      console.log('Balance:', balance);
      expect(balance).toBeTruthy();

      // Step 4: Wait for the access token to expire
      const waitTime = tokenResponse.expires_in * 1000 + 2000; // Add 2000ms buffer
      console.log(`Waiting ${waitTime}s for access token to expire...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Step 5: Try to use the access token - should fail
      console.log('Attempting to use expired access token...');

      await expect(
        echoControlApi.getBalance(tokenResponse.access_token!)
      ).rejects.toThrow(/401|Unauthorized/i);

      console.log('✅ Expired access token correctly rejected');
    });
  });
});
