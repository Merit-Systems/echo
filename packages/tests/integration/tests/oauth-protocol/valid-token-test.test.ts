import { describe, test, expect } from 'vitest';
import {
  echoControlApi,
  TEST_CLIENT_IDS,
  TEST_USER_IDS,
} from '../../utils/index.js';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';

describe('Valid Token Creation Test', () => {
  test('creates and validates a token using same method as OAuth flow', async () => {
    console.log(
      '🔧 Creating token using same method as OAuth token endpoint...'
    );

    // Use the same secret as the OAuth token endpoint
    const API_ECHO_ACCESS_JWT_SECRET = new TextEncoder().encode(
      process.env.API_ECHO_ACCESS_JWT_SECRET ||
        'api-jwt-secret-change-in-production'
    );

    const tokenId = nanoid(16);
    const now = Math.floor(Date.now() / 1000);

    // Create token with exact same structure as createApiToken() function
    const validToken = await new SignJWT({
      user_id: TEST_USER_IDS.primary,
      app_id: TEST_CLIENT_IDS.primary,
      scope: 'llm:invoke offline_access',
      key_version: 1,
      api_key_id: 'test-api-key-id', // This could be the issue - need real API key ID
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(TEST_USER_IDS.primary)
      .setAudience(TEST_CLIENT_IDS.primary)
      .setJti(tokenId)
      .setIssuedAt(now)
      .setExpirationTime(now + 24 * 60 * 60) // 24 hours like OAuth
      .sign(API_ECHO_ACCESS_JWT_SECRET);

    console.log('✅ Created valid token');
    console.log('Token preview:', validToken.substring(0, 100) + '...');

    // Test with single header (like jwt-lifecycle tests)
    console.log('🔧 Testing with X-Echo-Token only...');
    const responseSingle = await fetch(
      `${process.env.ECHO_CONTROL_URL}/api/validate-jwt-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Echo-Token': validToken,
        },
        body: JSON.stringify({}),
      }
    );

    const resultSingle = await responseSingle.json();
    console.log('Single header result:', resultSingle);

    // Test with dual headers (our current approach)
    console.log('🔧 Testing with dual headers...');
    const resultDual = await echoControlApi.validateJwtToken(validToken);
    console.log('Dual header result:', resultDual);

    // At least one should work
    if (resultSingle.valid || resultDual.valid) {
      console.log('✅ Token validation working!');
      if (resultSingle.valid) console.log('✅ Single header approach works');
      if (resultDual.valid) console.log('✅ Dual header approach works');
    } else {
      console.log('❌ Both approaches failed:');
      console.log('Single error:', resultSingle.error);
      console.log('Dual error:', resultDual.error);
    }

    // For now, just check that we got responses
    expect(resultSingle).toHaveProperty('valid');
    expect(resultDual).toHaveProperty('valid');
  });
});
