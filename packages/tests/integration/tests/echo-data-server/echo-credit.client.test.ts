import { describe, test, expect } from 'vitest';
import { TEST_CONFIG } from '../../utils';
import { TEST_USER_API_KEYS } from '../../config/test-data';

const TRUECAST_URL = 'https://true-cast-agent.vercel.app/api/trueCast';
const GLORIA_URL = 'https://api.itsgloria.ai/news';

interface TrueCastRequest {
  prompt: string;
}

interface GloriaNewsParams {
  feed_categories?: string;
}

describe('Echo Credit Client - X402 Proxy Tests', () => {
  describe('TrueCast Integration', () => {
    test('should successfully make proxied POST request to TrueCast', async () => {
      const apiKey = TEST_USER_API_KEYS.primary;
      const prompt = 'Was donald trump the first president of the united states?';

      const trueCastBody: TrueCastRequest = { prompt };

      const response = await fetch(
        `${TEST_CONFIG.services.echoDataServer}/x402?proxy=${encodeURIComponent(TRUECAST_URL)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(trueCastBody),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toBeDefined();

      console.log('✅ Successfully made proxied POST request to TrueCast');
      console.log('Response status:', response.status);
      console.log('Response data:', data);
    });

    test('should reject TrueCast request with invalid API key', async () => {
      const prompt = 'test prompt';
      const trueCastBody: TrueCastRequest = { prompt };

      const response = await fetch(
        `${TEST_CONFIG.services.echoDataServer}/x402?proxy=${encodeURIComponent(TRUECAST_URL)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer invalid-api-key-12345',
          },
          body: JSON.stringify(trueCastBody),
        }
      );

      expect(response.status).toBe(401);
      console.log('✅ Invalid API key correctly rejected for TrueCast request');
    });
  });

  describe('Gloria News Integration', () => {
    test('should successfully make proxied GET request to Gloria News', async () => {
      const apiKey = TEST_USER_API_KEYS.primary;
      const params: GloriaNewsParams = { feed_categories: 'base' };

      const queryParams = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const gloriaUrlWithParams = `${GLORIA_URL}?${queryParams}`;

      const response = await fetch(
        `${TEST_CONFIG.services.echoDataServer}/x402?proxy=${encodeURIComponent(gloriaUrlWithParams)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toBeDefined();

      console.log('✅ Successfully made proxied GET request to Gloria News');
      console.log('Response status:', response.status);
      console.log('Response data:', data);
    });

    test('should reject Gloria News request with invalid API key', async () => {
      const params: GloriaNewsParams = { feed_categories: 'base' };

      const queryParams = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const gloriaUrlWithParams = `${GLORIA_URL}?${queryParams}`;

      const response = await fetch(
        `${TEST_CONFIG.services.echoDataServer}/x402?proxy=${encodeURIComponent(gloriaUrlWithParams)}`,
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer invalid-api-key-12345',
          },
        }
      );

      expect(response.status).toBe(401);
      console.log('✅ Invalid API key correctly rejected for Gloria News request');
    });
  });

  describe('X402 Proxy - No Authentication', () => {
    test('should return 402 Payment Required when no auth headers provided to TrueCast proxy', async () => {
      const prompt = 'test prompt';
      const trueCastBody: TrueCastRequest = { prompt };

      const response = await fetch(
        `${TEST_CONFIG.services.echoDataServer}/x402?proxy=${encodeURIComponent(TRUECAST_URL)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trueCastBody),
        }
      );

      expect(response.status).toBe(402);

      const wwwAuthHeader = response.headers.get('WWW-Authenticate');
      expect(wwwAuthHeader).toBeTruthy();
      expect(wwwAuthHeader).toContain('X-402');

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Payment Required');

      console.log('✅ No auth headers correctly triggers 402 Payment Required for TrueCast proxy');
    });

    test('should return 402 Payment Required when no auth headers provided to Gloria proxy', async () => {
      const params: GloriaNewsParams = { feed_categories: 'base' };
      const queryParams = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const gloriaUrlWithParams = `${GLORIA_URL}?${queryParams}`;

      const response = await fetch(
        `${TEST_CONFIG.services.echoDataServer}/x402?proxy=${encodeURIComponent(gloriaUrlWithParams)}`,
        {
          method: 'GET',
        }
      );

      expect(response.status).toBe(402);

      const wwwAuthHeader = response.headers.get('WWW-Authenticate');
      expect(wwwAuthHeader).toBeTruthy();
      expect(wwwAuthHeader).toContain('X-402');

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Payment Required');

      console.log('✅ No auth headers correctly triggers 402 Payment Required for Gloria proxy');
    });
  });
});

