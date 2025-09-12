import { describe, test } from 'vitest';
import { TEST_CONFIG } from '../../utils/index.js';

describe('JWT Debug Test', () => {
  test('test header processing with direct request', async () => {
    const accessToken =
      'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTExMTExMTEtMTExMS0xMTExLTExMTEtMTExMTExMTExMTExIiwiYXBwX2lkIjoiODc2NTQzMjEtNDMyMS00MzIxLTQzMjEtZmVkY2JhOTg3NjU0Iiwic2NvcGUiOiJsbG06aW52b2tlIG9mZmxpbmVfYWNjZXNzIiwia2V5X3ZlcnNpb24iOjEsImFwaV9rZXlfaWQiOiI5NDdjYmJmOC1kMTc3LTQ2NTItYTAxZS0wZGViOTZhMWI3NDEiLCJzdWIiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJhdWQiOiI4NzY1NDMyMS00MzIxLTQzMjEtNDMyMS1mZWRjYmE5ODc2NTQiLCJqdGkiOiJ0RThYVWNlVXV1SFBFN09CIiwiaWF0IjoxNzQ5NTEzMTM1LCJleHAiOjE3NDk1OTk1MzV9.Ey5NemtlO7a8BtaO3WzDNnAqJ8mDSf_dSAVrBBVsyeM';

    console.log('🔧 Testing with manual fetch to isolate issue...');

    const jwt = process.env.INTEGRATION_TEST_JWT;

    const responseBoth = await fetch(
      `${TEST_CONFIG.services.echoControl}/api/validate-jwt-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
          'X-Echo-Token': accessToken, // Our Echo token to validate
        },
        body: JSON.stringify({}),
      }
    );

    const resultBoth = await responseBoth.json();
    console.log('🔧 Both headers result:', resultBoth);

    // Try with just X-Echo-Token header (original approach)
    const responseEcho = await fetch(
      `${TEST_CONFIG.services.echoControl}/api/validate-jwt-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Echo-Token': accessToken,
        },
        body: JSON.stringify({}),
      }
    );

    const resultEcho = await responseEcho.json();
    console.log('🔧 X-Echo-Token only result:', resultEcho);

    // Just check if we got results, don't fail the test yet
    console.log('Both results obtained successfully');

    // We'll analyze the results without failing
    if (!resultBoth.valid && !resultEcho.valid) {
      console.log('❌ Both validation methods failed');
      console.log(
        'This confirms there might be an issue with endpoint access or token format'
      );
    } else {
      console.log('✅ At least one validation method worked');
      if (resultBoth.valid) console.log('✅ Dual header approach worked!');
      if (resultEcho.valid)
        console.log('✅ X-Echo-Token only approach worked!');
    }
  });
});
