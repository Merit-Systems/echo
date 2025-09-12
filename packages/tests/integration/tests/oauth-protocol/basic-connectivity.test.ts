import { describe, test, expect, beforeAll } from 'vitest';
import { TEST_CONFIG } from '../../utils/index.js';

describe('Basic Connectivity Test', () => {
  beforeAll(async () => {
    console.log('🔧 Starting basic connectivity tests...');
  });

  test('environment variables are loaded', () => {
    expect(TEST_CONFIG.services.echoControl).toBeDefined();
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.AUTH_SECRET).toBeDefined();
    expect(process.env.INTEGRATION_TEST_JWT).toBeDefined();
  });

  test('can import utility functions', async () => {
    const { generateCodeVerifier, generateState } = await import(
      '../../utils/auth-helpers.js'
    );
    const { echoControlApi } = await import('../../utils/api-client.js');

    expect(echoControlApi).toBeDefined();
    expect(typeof generateCodeVerifier).toBe('function');
    expect(typeof generateState).toBe('function');

    // Test utility functions work
    const verifier = generateCodeVerifier();
    const state = generateState();

    expect(verifier).toMatch(/^[A-Za-z0-9._~-]{43,128}$/);
    expect(state).toBeTruthy();
    expect(state.length).toBeGreaterThan(0);
  });

  test('can reach echo-control health endpoint', async () => {
    const response = await fetch(
      `${TEST_CONFIG.services.echoControl}/api/health`
    );
    expect(response.ok).toBe(true);

    const health = await response.json();
    expect(health).toHaveProperty('status');
  });
  test('can reach echo-server health endpoint', async () => {
    const response = await fetch(
      `${TEST_CONFIG.services.echoDataServer}/health`
    );
    expect(response.ok).toBe(true);

    const health = await response.json();
    expect(health).toHaveProperty('status');
  });
});
