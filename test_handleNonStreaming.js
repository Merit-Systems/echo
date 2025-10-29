// Simple test to verify HandleNonStreamingService works with neverthrow
const { ResultAsync, fromPromise, ok, err } = require('neverthrow');

// Mock the service
class MockHandleNonStreamingService {
  handleNonStreaming(response, provider, req, res) {
    return fromPromise(
      response.json(),
      error => new Error(`Failed to parse JSON response: ${error}`)
    )
      .orElse(jsonError => {
        return fromPromise(
          response.text(),
          error => new Error(`Failed to read response text: ${error}`)
        ).andThen(text => {
          return err(new Error(`Failed to parse JSON response: ${text}`));
        });
      })
      .andThen(data => {
        return fromPromise(
          provider.transformResponse(data),
          error => new Error(`Failed to transform response: ${error}`)
        ).andThen(transformedData => {
          return fromPromise(
            provider.handleBody(JSON.stringify(transformedData), req.body),
            error => new Error(`Failed to handle body: ${error}`)
          ).map(transaction => {
            res.setHeader('content-type', 'application/json');
            return { transaction, data: transformedData };
          });
        });
      });
  }
}

// Test with successful JSON parsing
async function testSuccess() {
  console.log('Testing successful JSON parsing...');

  const mockResponse = {
    json: () => Promise.resolve({ message: 'Hello World' }),
  };

  const mockProvider = {
    transformResponse: data => Promise.resolve({ ...data, transformed: true }),
    handleBody: (data, body) => Promise.resolve({ id: 'tx123', cost: 100 }),
  };

  const mockReq = { body: {} };
  const mockRes = { setHeader: () => {} };

  const service = new MockHandleNonStreamingService();
  const result = await service.handleNonStreaming(
    mockResponse,
    mockProvider,
    mockReq,
    mockRes
  );

  if (result.isOk()) {
    console.log('✅ Success test passed:', result.value);
  } else {
    console.log('❌ Success test failed:', result.error);
  }
}

// Test with JSON parsing failure
async function testFailure() {
  console.log('Testing JSON parsing failure...');

  const mockResponse = {
    json: () => Promise.reject(new Error('Invalid JSON')),
    text: () => Promise.resolve('Invalid JSON text'),
  };

  const mockProvider = {
    transformResponse: data => Promise.resolve(data),
    handleBody: (data, body) => Promise.resolve({ id: 'tx123', cost: 100 }),
  };

  const mockReq = { body: {} };
  const mockRes = { setHeader: () => {} };

  const service = new MockHandleNonStreamingService();
  const result = await service.handleNonStreaming(
    mockResponse,
    mockProvider,
    mockReq,
    mockRes
  );

  if (result.isErr()) {
    console.log('✅ Failure test passed:', result.error.message);
  } else {
    console.log('❌ Failure test failed: Expected error but got success');
  }
}

// Run tests
async function runTests() {
  await testSuccess();
  await testFailure();
  console.log('All tests completed!');
}

runTests().catch(console.error);
