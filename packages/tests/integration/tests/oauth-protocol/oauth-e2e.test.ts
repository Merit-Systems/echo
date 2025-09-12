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

// Extend globalThis with test state
declare global {
  var testAuthCode: string;
  var testCodeVerifier: string;
  var testState: string;
  var testAccessToken: string;
  var testRefreshToken: string;
}

describe('OAuth End-to-End Flow Tests', () => {
  beforeAll(async () => {
    // Verify test environment
    expect(TEST_CONFIG.services.echoControl).toBeTruthy();
    expect(process.env.INTEGRATION_TEST_JWT).toBeTruthy();
  });

  describe('Step 1.5: Test Real OAuth Authorize Flow', () => {
    test('gets real authorization code from OAuth authorize endpoint', async () => {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      console.log(
        'Testing real OAuth authorize endpoint with proper authentication...'
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

      console.log('OAuth authorize succeeded! Redirect URL:', redirectUrl);

      // Extract authorization code from callback URL
      const callbackUrl = new URL(redirectUrl);
      const authCode = callbackUrl.searchParams.get('code');
      const returnedState = callbackUrl.searchParams.get('state');

      expect(authCode).toBeTruthy();
      expect(returnedState).toBe(state);

      console.log('✅ Got real authorization code from server!');

      // Store for next test
      globalThis.testAuthCode = authCode || '';
      globalThis.testCodeVerifier = codeVerifier;
      globalThis.testState = state;
    });
  });

  describe('Step 2: Authorization Code Ready', () => {
    test('has authorization code ready for token exchange', async () => {
      const authCode = globalThis.testAuthCode;

      expect(authCode).toBeTruthy();
      console.log('✅ Using REAL authorization code from OAuth server');

      expect(authCode.split('.')).toHaveLength(3); // Valid JWT structure
    });
  });

  describe('Step 3: Exchange Authorization Code for Tokens', () => {
    test('exchanges valid authorization code for access and refresh tokens', async () => {
      // Get values from previous test
      const authCode = globalThis.testAuthCode;
      const codeVerifier = globalThis.testCodeVerifier;

      expect(authCode).toBeTruthy();
      expect(codeVerifier).toBeTruthy();

      console.log('Exchanging auth code for tokens...');

      const tokenResponse = await echoControlApi.exchangeCodeForToken({
        code: authCode,
        client_id: TEST_CLIENT_IDS.primary,
        redirect_uri: 'http://localhost:3000/callback',
        code_verifier: codeVerifier,
      });

      console.log('Token response:', {
        access_token: tokenResponse.access_token.substring(0, 50) + '...',
        token_type: tokenResponse.token_type,
        expires_in: tokenResponse.expires_in,
        scope: tokenResponse.scope,
        has_refresh_token: !!tokenResponse.refresh_token,
      });

      // Verify token response structure
      expect(tokenResponse.access_token).toBeTruthy();
      expect(tokenResponse.token_type).toBe('Bearer');
      expect(tokenResponse.expires_in).toBeGreaterThan(0);
      expect(tokenResponse.scope).toBeTruthy();
      expect(tokenResponse.refresh_token).toBeTruthy();

      // Store for next test
      globalThis.testAccessToken = tokenResponse.access_token;
      globalThis.testRefreshToken = tokenResponse.refresh_token || '';
    });
  });

  describe('Step 4: Validate Access Token', () => {
    test('validates access token with JWT validation endpoint', async () => {
      const accessToken = globalThis.testAccessToken;
      expect(accessToken).toBeTruthy();

      console.log('Validating access token...');
      console.log('Access token structure:', {
        parts: accessToken.split('.').length,
        header: accessToken.split('.')[0],
        payload_preview: accessToken.split('.')[1]?.substring(0, 50) + '...',
      });

      // Decode payload for debugging
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1] || ''));
        console.log('Decoded access token payload:', payload);
      } catch (e) {
        console.log(
          'Failed to decode access token payload:',
          e instanceof Error ? e.message : String(e)
        );
      }

      console.log('Making validation request with X-Echo-Token header...');
      const validationResult =
        await echoControlApi.validateJwtToken(accessToken);

      console.log('Validation result:', {
        valid: validationResult.valid,
        error: validationResult.error,
        userId: validationResult.userId,
        appId: validationResult.appId,
        scope: validationResult.scope,
      });

      // Verify token is valid
      expect(validationResult.valid).toBe(true);
      expect(validationResult.userId).toBeTruthy();

      // Verify token claims
      expect(validationResult.userId).toBe(TEST_USER_IDS.primary);
      expect(validationResult.appId).toBe(TEST_CLIENT_IDS.primary);
      expect(validationResult.scope).toBe('llm:invoke offline_access');
    });
  });
  // This would simulate a user who first authenticates with echo via a different app. They should be able to do this.
  // It should create an app membership for the user with the app, with customer permission.
  describe('User should be able to create a valid token for an app they are not a member of', () => {
    test('should get 200 when trying to make a request', async () => {
      const { generateCodeVerifier, generateCodeChallenge, generateState } =
        await import('../../utils/auth-helpers.js');

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();

      console.log(
        `🔑 Getting authorization code for paid user (primary user with primary client)...`
      );

      const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
        client_id: TEST_CLIENT_IDS.secondary,
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

      // Exchange authorization code for tokens
      console.log('🔄 Exchanging auth code for access token...');

      const tokenResponse = await echoControlApi
        .exchangeCodeForToken({
          code: authCode!,
          client_id: TEST_CLIENT_IDS.secondary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: codeVerifier,
        })
        .catch(error => {
          console.log('Error:', error);
        });

      expect(tokenResponse?.echo_app.id).toBe(TEST_CLIENT_IDS.secondary);
      console.log(
        '✅ User is able to authenticate against an app they are not a member of'
      );
    });
  });
});
