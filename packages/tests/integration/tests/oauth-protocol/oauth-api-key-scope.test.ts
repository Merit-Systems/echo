import { describe, test, expect, beforeAll } from 'vitest';
import {
  TEST_CLIENT_IDS,
  TEST_USER_IDS,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  echoControlApi,
  TEST_CONFIG,
} from '../../utils/index.js';

describe('OAuth API Key Creation with api_key:create Scope', () => {
  beforeAll(async () => {
    // Verify test environment
    expect(TEST_CONFIG.services.echoControl).toBeTruthy();
    expect(process.env.INTEGRATION_TEST_JWT).toBeTruthy();
  });

  describe('Token Exchange with api_key:create scope', () => {
    test('should return an API key as access token when api_key:create scope is requested', async () => {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      console.log('Getting authorization code with api_key:create scope...');

      const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke offline_access api_key:create',
        prompt: 'none', // Skip consent page for automated testing
      });

      // Extract authorization code from callback URL
      const callbackUrl = new URL(redirectUrl);
      const authCode = callbackUrl.searchParams.get('code');
      const returnedState = callbackUrl.searchParams.get('state');

      expect(authCode).toBeTruthy();
      expect(returnedState).toBe(state);

      console.log('✅ Got authorization code with api_key:create scope');

      // Exchange authorization code for tokens
      console.log('Exchanging auth code for API key...');

      const tokenResponse = await echoControlApi.exchangeCodeForToken({
        code: authCode!,
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        code_verifier: codeVerifier,
      });

      console.log('Token response:', {
        access_token_preview:
          tokenResponse.access_token.substring(0, 50) + '...',
        token_type: tokenResponse.token_type,
        expires_in: tokenResponse.expires_in,
        scope: tokenResponse.scope,
        has_refresh_token: !!tokenResponse.refresh_token,
      });

      // Verify token response structure
      expect(tokenResponse.access_token).toBeTruthy();
      expect(tokenResponse.token_type).toBe('Bearer');
      expect(tokenResponse.scope).toContain('api_key:create');
      expect(tokenResponse.refresh_token).toBeTruthy();

      // Verify the access token is an API key (not a JWT)
      // API keys should NOT have JWT structure (3 parts separated by dots)
      const accessTokenParts = tokenResponse.access_token.split('.');
      expect(accessTokenParts.length).not.toBe(3); // Not a JWT

      // API keys should start with the API key prefix (typically 'echo_')
      expect(tokenResponse.access_token).toMatch(/^echo_/);

      // Verify the expires_in is very long (100 years = ~3.15B seconds)
      // We'll check it's greater than 10 years (315M seconds)
      expect(tokenResponse.expires_in).toBeGreaterThan(315_000_000);

      console.log('✅ Received API key as access token');
      console.log(`API key length: ${tokenResponse.access_token.length}`);
      console.log(
        `Expires in: ${tokenResponse.expires_in} seconds (~${Math.floor(tokenResponse.expires_in / 31536000)} years)`
      );

      // Verify the API key can be used to authenticate
      console.log('Testing API key authentication...');
      const balance = await echoControlApi.getBalance(
        tokenResponse.access_token
      );

      expect(balance).toBeDefined();
      expect(typeof balance.balance).toBe('number');

      console.log('✅ API key successfully used for authentication');
    });

    test('should return normal JWT when api_key:create scope is NOT requested', async () => {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      console.log('Getting authorization code WITHOUT api_key:create scope...');

      const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke offline_access', // No api_key:create
        prompt: 'none',
      });

      const callbackUrl = new URL(redirectUrl);
      const authCode = callbackUrl.searchParams.get('code');

      expect(authCode).toBeTruthy();

      // Exchange authorization code for tokens
      const tokenResponse = await echoControlApi.exchangeCodeForToken({
        code: authCode!,
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        code_verifier: codeVerifier,
      });

      // Verify the access token IS a JWT (has 3 parts)
      const accessTokenParts = tokenResponse.access_token.split('.');
      expect(accessTokenParts.length).toBe(3); // Is a JWT

      // JWT expiration should be short (not 100 years)
      expect(tokenResponse.expires_in).toBeLessThan(31_536_000); // Less than 1 year

      console.log('✅ Received normal JWT token without api_key:create scope');
    });

    test('should handle mixed scopes correctly (llm:invoke + api_key:create)', async () => {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'llm:invoke api_key:create', // Mixed scopes
        prompt: 'none',
      });

      const callbackUrl = new URL(redirectUrl);
      const authCode = callbackUrl.searchParams.get('code');

      expect(authCode).toBeTruthy();

      const tokenResponse = await echoControlApi.exchangeCodeForToken({
        code: authCode!,
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        code_verifier: codeVerifier,
      });

      // Should return API key because api_key:create is present
      expect(tokenResponse.access_token).toMatch(/^echo_/);
      expect(tokenResponse.scope).toContain('llm:invoke');
      expect(tokenResponse.scope).toContain('api_key:create');

      console.log('✅ Mixed scopes handled correctly');
    });
  });
});
