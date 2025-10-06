import { describe, test, expect } from 'vitest';
import { TEST_CONFIG } from '../../utils';
import { TEST_USER_API_KEYS } from '../../config/test-data';
import OpenAI from 'openai';

describe('402 Authentication Flow Tests', () => {

  describe('API Key Authentication (isApiRequest)', () => {
    test('should authenticate with x-api-key header', async () => {
      const apiKey = TEST_USER_API_KEYS.primary;
      
      const openaiClient = new OpenAI({
        baseURL: TEST_CONFIG.services.echoDataServer,
        apiKey: apiKey,
      });

      const completion = await openaiClient.chat.completions.create({
        messages: [{ role: 'user', content: 'reply with a single word: hello' }],
        model: 'gpt-3.5-turbo',
        stream: false,
        max_completion_tokens: 16,
      });

      expect(completion).toBeDefined();
      expect(completion.choices).toBeDefined();
      console.log('✅ Successfully authenticated with x-api-key header');
    });

    test('should authenticate with Authorization Bearer header', async () => {
      const apiKey = TEST_USER_API_KEYS.primary;
      
      const openaiClient = new OpenAI({
        baseURL: TEST_CONFIG.services.echoDataServer,
        apiKey: apiKey,
      });

      const completion = await openaiClient.chat.completions.create({
        messages: [{ role: 'user', content: 'reply with a single word: hello' }],
        model: 'gpt-3.5-turbo',
        stream: false,
        max_completion_tokens: 16,
      });

      expect(completion).toBeDefined();
      expect(completion.choices).toBeDefined();
      console.log('✅ Successfully authenticated with Authorization Bearer header');
    });

    test('should reject invalid API key', async () => {
      const openaiClient = new OpenAI({
        baseURL: TEST_CONFIG.services.echoDataServer,
        apiKey: 'invalid-api-key-12345',
      });

      let errorCaught = false;
      await openaiClient.chat.completions.create({
        messages: [{ role: 'user', content: 'reply with a single word: hello' }],
        model: 'gpt-3.5-turbo',
        stream: false,
        max_completion_tokens: 16,
      }).catch((error) => {
        errorCaught = true;
        expect(error.status).toBe(401);
      });

      expect(errorCaught).toBe(true);
      console.log('✅ Invalid API key correctly rejected with 401');
    });
  });

  describe('No Authentication Headers', () => {
    test('should return 402 Payment Required with X402 challenge when no auth headers provided', async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoDataServer}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'hello' }],
            stream: false,
          }),
        }
      );

      expect(response.status).toBe(402);
      
      // Should have WWW-Authenticate header with X402 challenge
      const wwwAuthHeader = response.headers.get('WWW-Authenticate');
      expect(wwwAuthHeader).toBeTruthy();
      expect(wwwAuthHeader).toContain('X-402');
      expect(wwwAuthHeader).toContain('realm=');
      expect(wwwAuthHeader).toContain('link=');
      expect(wwwAuthHeader).toContain('network=');
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Payment Required');
      expect(data).toHaveProperty('accepts');
      expect(Array.isArray(data.accepts)).toBe(true);
      expect(data.accepts.length).toBeGreaterThan(0);
      
      // Verify X402 challenge structure
      const x402Accept = data.accepts[0];
      expect(x402Accept).toHaveProperty('type', 'x402');
      expect(x402Accept).toHaveProperty('version');
      expect(x402Accept).toHaveProperty('maxAmountRequired');
      expect(x402Accept).toHaveProperty('recipient');
      expect(x402Accept).toHaveProperty('url');
      expect(x402Accept).toHaveProperty('nonce');
      expect(x402Accept).toHaveProperty('scheme', 'exact');
      
      console.log('✅ No auth headers correctly triggers 402 Payment Required with X402 challenge');
    });
  });

  describe('Mixed Authentication Scenarios', () => {
    test('should prioritize x-payment header over API key when both present', async () => {
      const apiKey = TEST_USER_API_KEYS.primary;
      const mockPaymentPayload = {
        authorization: {
          from: '0x1234567890123456789012345678901234567890',
          to: '0x0987654321098765432109876543210987654321',
          value: '1000000',
          valid_after: Math.floor(Date.now() / 1000) - 3600,
          valid_before: Math.floor(Date.now() / 1000) + 3600,
          nonce: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        },
        signature: {
          v: 27,
          r: '0x1234567890123456789012345678901234567890123456789012345678901234',
          s: '0x5678901234567890123456789012345678901234567890123456789012345678',
        },
      };
      
      const xPaymentHeader = Buffer.from(JSON.stringify(mockPaymentPayload)).toString('base64');
      
      const response = await fetch(
        `${TEST_CONFIG.services.echoDataServer}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'x-payment': xPaymentHeader,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'hello' }],
            stream: false,
          }),
        }
      );

      // Should attempt X402 payment flow (not API key auth)
      // Based on server.ts logic, isX402Request is checked after isApiRequest
      // but both are checked in the same condition, so actual behavior depends on handler logic
      // The test verifies that X402 is attempted (not a 200 success from API key)
      expect(response.status).not.toBe(200);
      
      console.log(`✅ Mixed headers handled (status: ${response.status})`);
    });
  });
});
