import { describe, test, expect, beforeAll } from 'vitest';
import {
  TEST_CLIENT_IDS,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  echoControlApi,
  TEST_CONFIG,
} from '../../utils/index.js';

describe('OAuth Authorization Minimal Test', () => {
  beforeAll(async () => {
    expect(TEST_CONFIG.services.echoControl).toBeTruthy();
    expect(process.env.INTEGRATION_TEST_JWT).toBeTruthy();

    // Verify basic connectivity
    await echoControlApi.healthCheck();
  });

  test('INTEGRATION_TEST_JWT should authenticate with OAuth authorize endpoint', async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    console.log('🔧 Testing OAuth authorize with INTEGRATION_TEST_JWT...');
    console.log(
      'JWT token preview:',
      process.env.INTEGRATION_TEST_JWT?.substring(0, 50) + '...'
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

    console.log('📍 Redirect URL:', redirectUrl);

    // Parse the redirect URL
    const url = new URL(redirectUrl);
    console.log('🌐 Redirect hostname:', url.hostname);
    console.log('🛣️  Redirect pathname:', url.pathname);
    console.log(
      '🔍 Redirect search params:',
      Object.fromEntries(url.searchParams.entries())
    );

    // Check if we got a real OAuth callback with auth code
    const authCode = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');

    if (authCode) {
      console.log('✅ SUCCESS: Got authorization code!');
      console.log('🔑 Auth code preview:', authCode.substring(0, 50) + '...');
      expect(authCode).toBeTruthy();
      expect(returnedState).toBe(state);
    } else {
      console.log('❌ FAILED: No authorization code in redirect');
      console.log(
        '🚫 This means authentication failed or consent was not granted'
      );

      // Show what we got instead
      if (url.pathname.includes('sign-in')) {
        console.log('👤 Redirected to sign-in - authentication failed');
      } else if (url.pathname.includes('consent')) {
        console.log('✋ Redirected to consent page - need to grant permission');
      } else {
        console.log('🤔 Unknown redirect destination');
      }

      expect.fail(
        `Expected authorization code but got redirect to: ${url.pathname}`
      );
    }
  });
});
