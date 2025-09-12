import { describe, test, expect, beforeAll } from 'vitest';
import {
  echoControlApi,
  TEST_CLIENT_IDS,
  TEST_USER_IDS,
  TEST_CONFIG,
} from '../../utils/index.js';

describe('JWT Token Lifecycle Tests', () => {
  beforeAll(async () => {
    // Ensure echo-control is running and healthy
    await echoControlApi.healthCheck();
  });

  describe('Token Exchange API', () => {
    test('rejects invalid authorization codes', async () => {
      const mockCode = 'mock_auth_code_' + Math.random().toString(36);

      await expect(
        echoControlApi.exchangeCodeForToken({
          code: mockCode,
          client_id: TEST_CLIENT_IDS.primary,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier:
            'test-verifier-for-jwt-validation-that-meets-minimum-43-character-requirement-for-pkce',
        })
      ).rejects.toThrow(/invalid.*grant|authorization.*code/i);
    });
  });

  describe('Token Validation API', () => {
    test('validates JWT tokens against echo-control', async () => {
      // Test with invalid token - should return { valid: false } not throw
      const invalidToken = 'invalid.jwt.token';

      const validationResult =
        await echoControlApi.validateJwtToken(invalidToken);
      expect(validationResult.valid).toBe(false);
    });

    test('rejects tokens with invalid signatures', async () => {
      // Create token with valid structure but invalid signature
      const validPayload = Buffer.from(
        JSON.stringify({
          user_id: TEST_USER_IDS.primary,
          app_id: TEST_CLIENT_IDS.primary,
          scope: 'llm:invoke',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        })
      ).toString('base64url');

      const invalidSignatureToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${validPayload}.invalid-signature`;

      const validationResult = await echoControlApi.validateJwtToken(
        invalidSignatureToken
      );
      expect(validationResult.valid).toBe(false);
    });

    test('rejects tokens with missing required fields', async () => {
      const incompletePayload = Buffer.from(
        JSON.stringify({
          sub: TEST_USER_IDS.primary,
          aud: 'echo-proxy',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
          // Missing user_id, app_id, scope - required for API tokens
        })
      ).toString('base64url');

      const incompleteToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${incompletePayload}.signature`;

      const validationResult =
        await echoControlApi.validateJwtToken(incompleteToken);
      expect(validationResult.valid).toBe(false);
    });

    test('rejects malformed token structures', async () => {
      const malformedTokens = [
        'not.a.jwt', // Invalid structure
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..signature', // Empty payload
        'header.payload', // Missing signature
      ];

      for (const token of malformedTokens) {
        const validationResult = await echoControlApi.validateJwtToken(token);
        expect(validationResult.valid).toBe(false);
      }
    });

    test('rejects expired tokens', async () => {
      const expiredPayload = Buffer.from(
        JSON.stringify({
          user_id: TEST_USER_IDS.primary,
          app_id: TEST_CLIENT_IDS.primary,
          scope: 'llm:invoke',
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
          iat: Math.floor(Date.now() / 1000) - 7200,
        })
      ).toString('base64url');

      const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${expiredPayload}.signature`;

      const validationResult =
        await echoControlApi.validateJwtToken(expiredToken);
      expect(validationResult.valid).toBe(false);
    });

    test('validates tokens via Authorization header', async () => {
      const invalidToken = 'invalid.jwt.token';

      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/validate-jwt-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${invalidToken}`,
          },
          body: JSON.stringify({}),
        }
      );

      expect(response.status >= 400).toBe(true);

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        expect(result.valid).toBe(false);
      } else {
        // Server returned HTML error page, which means it rejected the request
        const text = await response.text();
        expect(text).toBeTruthy(); // Just verify we got a response
      }
    });

    test('validates tokens via X-Echo-Token header (without Bearer prefix)', async () => {
      const invalidToken = 'invalid.jwt.token';

      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/validate-jwt-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Echo-Token': invalidToken, // No Bearer prefix
          },
          body: JSON.stringify({}),
        }
      );

      expect(response.status >= 400).toBe(true);
      const result = await response.json();
      expect(result.valid).toBe(false);
    });

    test('rejects requests with missing token headers', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/validate-jwt-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // No Authorization or X-Echo-Token header
          },
          body: JSON.stringify({}),
        }
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.valid).toBe(false);
    });
  });

  describe('Server Error Handling', () => {
    test('returns consistent error format for validation failures', async () => {
      const invalidToken = 'invalid.token.format';

      const validationResult =
        await echoControlApi.validateJwtToken(invalidToken);

      expect(validationResult).toHaveProperty('valid');
      expect(validationResult.valid).toBe(false);

      // Should not expose internal error details
      if (validationResult.error) {
        expect(validationResult.error).not.toMatch(/internal|database|sql/i);
      }
    });

    test('handles HTTP method validation', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/validate-jwt-token`,
        {
          method: 'GET', // Wrong method
        }
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400); // Bad Request (server returns 400, not 405)
    });

    test('handles content-type validation', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoControl}/api/validate-jwt-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain', // Wrong content type
            'X-Echo-Token': 'test.token.here',
          },
          body: 'plain text body',
        }
      );

      expect(response.ok).toBe(false);
      const result = await response.json();
      expect(result.valid).toBe(false);
    });
  });
});
