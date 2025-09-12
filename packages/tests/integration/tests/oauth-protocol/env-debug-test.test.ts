import { describe, test, expect } from 'vitest';
import { TEST_CONFIG } from '../../utils/index.js';

describe('Environment Debug Test', () => {
  test('check environment variables and secrets', async () => {
    console.log('🔧 Checking environment variables...');

    // Check what secrets are configured
    console.log('Environment variables (redacted):');
    console.log(
      '- API_ECHO_ACCESS_JWT_SECRET:',
      process.env.API_ECHO_ACCESS_JWT_SECRET ? '[SET]' : '[NOT SET]'
    );
    console.log(
      '- OAUTH_CODE_SIGNING_JWT_SECRET:',
      process.env.OAUTH_CODE_SIGNING_JWT_SECRET ? '[SET]' : '[NOT SET]'
    );
    console.log(
      '- INTEGRATION_TEST_JWT:',
      process.env.INTEGRATION_TEST_JWT ? '[SET]' : '[NOT SET]'
    );

    // Check what the echo-control service sees by calling a debug endpoint
    const response = await fetch(
      `${TEST_CONFIG.services.echoControl}/api/health`,
      {
        method: 'GET',
      }
    );

    const healthData = await response.json();
    console.log('Echo-control health response:', healthData);

    // Try to get environment info from echo-control if possible
    const envResponse = await fetch(
      `${TEST_CONFIG.services.echoControl}/api/debug-env`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.INTEGRATION_TEST_JWT}`,
        },
      }
    );

    if (envResponse.status === 404) {
      console.log('❌ Debug endpoint not available in echo-control');
    } else {
      const envData = await envResponse.json();
      console.log('Echo-control environment info:', envData);
    }

    // Just verify we can connect
    expect(response.ok).toBe(true);
  });
});
