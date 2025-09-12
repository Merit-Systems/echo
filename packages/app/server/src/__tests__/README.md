# Echo Server Test Suite

This test suite has been refactored to work with the new echo-control integration. The tests now mock the EchoControlService instead of the old account manager system.

## Overview

The test suite comprehensively tests the echo-server's ability to:

1. **Authentication & Authorization**: Tests that requests are properly authenticated through echo-control
2. **Provider Support**: Tests all supported providers (GPT, AnthropicGPT, AnthropicNative)
3. **Streaming & Non-streaming**: Tests both streaming and non-streaming endpoints
4. **Transaction Recording**: Tests that usage is properly recorded through echo-control
5. **Error Handling**: Tests various error scenarios (payment required, invalid auth, etc.)

## Test Structure

### Setup (`setup.ts`)

- Mocks the EchoControlService class
- Mocks the global fetch function for API calls
- Sets up environment variables for testing

### Main Test Files

#### `endpoints.test.ts`

Comprehensive provider-specific tests including:

**Provider Coverage:**

- GPT models (`gpt-3.5-turbo`, `gpt-4o`) via `/chat/completions`
- AnthropicGPT models (`claude-3-5-sonnet-20240620`) via `/chat/completions`
- AnthropicNative models (`claude-3-5-sonnet-20240620`) via `/messages`

**Test Categories:**

1. **Non-streaming endpoints** (for each provider):
   - Successful request handling
   - Transaction creation verification
   - Correct content-type headers

2. **Streaming endpoints** (for each provider):
   - Successful streaming request handling
   - Transaction creation with proper token counts
   - Multi-chunk content handling

3. **Authentication Tests**:
   - Bearer token support (OpenAI format)
   - x-api-key support (Anthropic native)
   - Invalid token rejection

4. **Error Handling**:
   - Upstream API errors (400, 429, etc.)
   - Unknown model errors

5. **Account Balance Tests**:
   - Payment required (402) when balance is zero
   - Successful requests with sufficient balance

6. **Request Processing**:
   - `stream_options` addition for streaming requests
   - No `stream_options` for non-streaming requests

#### `server.test.ts`

Core server functionality tests including:

1. **Payment Required Tests**: Ensures 402 errors when balance is insufficient
2. **Streaming Endpoint Tests**: Tests streaming for all provider types
3. **Non-streaming Endpoint Tests**: Tests non-streaming for supported providers
4. **Authentication Tests**: Core auth validation
5. **Account Management**: Balance checking and error handling

## Mocking Strategy

### EchoControlService Mocking

The tests use a comprehensive mock of the EchoControlService that simulates:

```typescript
// Mock authentication response
{
  userId: 'user-ben-reilly',
  echoAppId: 'echo-app-123',
  user: { id: '...', email: '...', name: '...' },
  echoApp: { id: '...', name: '...', userId: '...' }
}

// Mock methods
verifyApiKey: jest.Mock       // Returns auth result or null
getBalance: jest.Mock         // Returns numeric balance
createTransaction: jest.Mock  // Records transaction calls
getUserId: jest.Mock          // Returns user ID
// ... other getters
```

### API Response Mocking

The tests mock upstream API responses for different provider formats:

**OpenAI Format (GPT & AnthropicGPT):**

- Non-streaming: Standard completion response with usage
- Streaming: SSE format with content deltas and final usage

**Anthropic Native Format:**

- Streaming only: SSE with content_block_delta and message_delta events

## Key Test Scenarios

### 1. Provider-Specific Streaming/Non-streaming

Each provider is tested for both streaming and non-streaming capabilities (where supported).

### 2. Transaction Recording

Tests verify that `createTransaction` is called with correct parameters:

- Model name
- Token counts (input, output, total)
- Cost calculation
- Success status

### 3. Authentication Flow

Tests verify the complete auth flow:

- Header parsing (Bearer vs x-api-key)
- EchoControlService.verifyApiKey() call
- Proper error responses for invalid auth

### 4. Balance Checking

Tests verify balance checking:

- Successful requests with sufficient balance
- 402 Payment Required when balance is zero
- Proper user ID logging for payment required errors

### 5. Error Propagation

Tests verify proper error handling:

- Upstream API errors are passed through
- Unknown models return 400 errors
- Invalid auth returns 401 errors

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test endpoints.test.ts
pnpm test server.test.ts

# Run with coverage
pnpm test -- --coverage
```

## Test Assertions

The tests make comprehensive assertions about:

1. **HTTP Status Codes**: Correct status for success/error scenarios
2. **Response Headers**: Correct content-type headers
3. **Response Body**: Proper response structure and content
4. **Service Calls**: EchoControlService methods called with correct parameters
5. **Token Accounting**: Accurate token counting and transaction recording

## Provider-Specific Behavior

### GPT Provider

- Uses OpenAI API format
- Reports total tokens for accounting
- Supports both streaming and non-streaming

### AnthropicGPT Provider

- Uses OpenAI API format via Anthropic's compatibility layer
- Reports total tokens for accounting
- Supports both streaming and non-streaming

### AnthropicNative Provider

- Uses Anthropic's native API format
- Only reports output tokens (input tokens not available in streaming)
- Streaming only (non-streaming not implemented)
- Uses x-api-key authentication header

## Future Enhancements

The test suite can be extended to cover:

1. Additional provider types (Gemini, etc.)
2. More complex error scenarios
3. Rate limiting behavior
4. Concurrent request handling
5. Performance testing
