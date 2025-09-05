import { TEST_CONFIG } from '@/config/test-config';
import { TEST_USER_API_KEYS } from '@/config/test-data';
import { expect, test, describe } from 'vitest';
import OpenAI from 'openai';

describe('In-Flight Requests Monitor', () => {
  test('should return in-flight request count for authenticated user', async () => {
    const apiKey = TEST_USER_API_KEYS.primary;

    const response = await fetch(
      `${TEST_CONFIG.services.echoDataServer}/in-flight-requests`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('echoAppId');
    expect(data).toHaveProperty('numberInFlight');
    expect(data).toHaveProperty('maxAllowed');

    expect(typeof data.userId).toBe('string');
    expect(typeof data.echoAppId).toBe('string');
    expect(typeof data.numberInFlight).toBe('number');
    expect(typeof data.maxAllowed).toBe('number');

    expect(data.numberInFlight).toBeGreaterThanOrEqual(0);
    expect(data.maxAllowed).toBeGreaterThan(0);

    console.log('📊 In-flight requests data:', data);
  });

  test('should reject unauthenticated requests', async () => {
    const response = await fetch(
      `${TEST_CONFIG.services.echoDataServer}/in-flight-requests`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    expect(response.status).toBe(401);
  });

  test('should reject requests with invalid API key', async () => {
    const response = await fetch(
      `${TEST_CONFIG.services.echoDataServer}/in-flight-requests`,
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-api-key',
          'Content-Type': 'application/json',
        },
      }
    );

    expect(response.status).toBe(401);
  });

  test('should return consistent data structure', async () => {
    const apiKey = TEST_USER_API_KEYS.primary;

    // Make multiple requests to ensure consistent structure
    const requests = Array(3)
      .fill(null)
      .map(() =>
        fetch(`${TEST_CONFIG.services.echoDataServer}/in-flight-requests`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        })
      );

    const responses = await Promise.all(requests);
    const dataArray = await Promise.all(responses.map(r => r.json()));

    // All responses should have the same structure
    expect(dataArray.length).toBeGreaterThan(0);
    const firstData = dataArray[0];
    expect(firstData).toBeDefined();

    dataArray.forEach((data, index) => {
      expect(responses[index]?.status).toBe(200);
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('echoAppId');
      expect(data).toHaveProperty('numberInFlight');
      expect(data).toHaveProperty('maxAllowed');

      // User and app should be consistent across requests
      expect(data.userId).toBe(firstData.userId);
      expect(data.echoAppId).toBe(firstData.echoAppId);
      expect(data.maxAllowed).toBe(firstData.maxAllowed);
    });
  });

  test('comprehensive in-flight monitoring: max requests, disconnects, and auth errors', async () => {
    const apiKey = TEST_USER_API_KEYS.primary;

    // Helper function to get current in-flight count
    const getInFlightCount = async () => {
      const response = await fetch(
        `${TEST_CONFIG.services.echoDataServer}/in-flight-requests`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      return data.numberInFlight;
    };

    // Helper function to create OpenAI client
    const createClient = (key: string = apiKey) =>
      new OpenAI({
        baseURL: TEST_CONFIG.services.echoDataServer,
        apiKey: key,
      });

    console.log('🚀 Starting comprehensive in-flight monitoring test...');

    // 1. Test that >10 requests bounce from server due to max in-flight
    console.log(
      '📋 Test 1: Sending >10 requests to trigger max in-flight limit...'
    );

    const client = createClient();
    const requestPromises: Promise<any>[] = [];
    const errors: any[] = [];

    // Create 15 concurrent requests (more than the max of 10)
    for (let i = 0; i < 15; i++) {
      const requestPromise = client.chat.completions
        .create({
          messages: [
            {
              role: 'user',
              content: `Request ${i + 1}: Tell me a very long story about space exploration with lots of details`,
            },
          ],
          model: 'gpt-3.5-turbo',
          stream: true,
        })
        .catch(error => {
          errors.push(error);
          return null;
        });
      requestPromises.push(requestPromise);
    }

    // Wait for all requests to complete or fail
    const results = await Promise.all(requestPromises);

    // Verify that some requests were rejected with 429 status
    const rejectedRequests = errors.filter(error => error?.status === 429);
    expect(rejectedRequests.length).toBeGreaterThan(0);
    console.log(
      `✅ Test 1 passed: ${rejectedRequests.length} requests rejected with 429 status (max in-flight exceeded)`
    );

    // Process successful streams to completion
    const successfulStreams = results.filter(result => result !== null);
    for (const stream of successfulStreams) {
      if (stream) {
        try {
          for await (const chunk of stream) {
            // Consume the stream
          }
        } catch (error) {
          // Stream might be aborted, that's fine
        }
      }
    }

    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Check that after this happens, the in-flight requests info endpoint returns 0 current requests
    console.log(
      '📋 Test 2: Checking in-flight count after requests complete...'
    );

    const inFlightAfterBounce = await getInFlightCount();
    expect(inFlightAfterBounce).toBe(0);
    console.log(
      `✅ Test 2 passed: In-flight count is ${inFlightAfterBounce} after requests completed`
    );

    // 3. Simulate a client disconnect
    console.log('📋 Test 3: Simulating client disconnect...');

    const disconnectClient = createClient();
    const streamPromise = disconnectClient.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Tell me a long story that I will disconnect from',
        },
      ],
      model: 'gpt-3.5-turbo',
      stream: true,
    });

    // Start consuming the stream then abort it
    const stream = await streamPromise;
    let chunkCount = 0;

    try {
      for await (const chunk of stream) {
        chunkCount++;
        if (chunkCount === 2) {
          // Simulate disconnect by breaking out of the loop
          break;
        }
      }
    } catch (error) {
      // Expected when we disconnect
    }

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    const inFlightAfterDisconnect = await getInFlightCount();
    expect(inFlightAfterDisconnect).toBe(0);
    console.log(
      `✅ Test 3 passed: In-flight count is ${inFlightAfterDisconnect} after client disconnect`
    );

    // 4. Simulate an auth error
    console.log('📋 Test 4: Simulating auth error...');

    const invalidClient = createClient('invalid-api-key');

    try {
      await invalidClient.chat.completions.create({
        messages: [
          { role: 'user', content: 'This should fail with auth error' },
        ],
        model: 'gpt-3.5-turbo',
        stream: false,
      });
    } catch (error: any) {
      expect(error.status).toBe(401);
    }

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    const inFlightAfterAuthError = await getInFlightCount();
    expect(inFlightAfterAuthError).toBe(0);
    console.log(
      `✅ Test 4 passed: In-flight count is ${inFlightAfterAuthError} after auth error`
    );

    console.log('🎉 All comprehensive in-flight monitoring tests passed!');
  }, 60000); // 60 second timeout for this comprehensive test
});
