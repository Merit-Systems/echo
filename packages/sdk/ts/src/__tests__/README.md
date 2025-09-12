# Echo CLI Test Suite

This directory contains a comprehensive testing suite for the Echo TypeScript SDK and CLI. The tests are designed to verify every aspect of the CLI functionality against a real running Echo server.

## Test Structure

### 1. Unit Tests

#### `auth.test.ts`

Tests the authentication module functionality:

- API key validation (format, length, prefix)
- Secure storage and retrieval of API keys using keytar
- Error handling for storage operations
- Integration scenarios (store → retrieve → remove cycle)

#### `client.test.ts`

Tests the EchoClient SDK functionality:

- Authentication header inclusion
- Balance fetching (with and without app ID)
- Payment link creation
- Echo app listing and retrieval
- URL generation
- Error handling (network errors, 401s, timeouts)

### 2. CLI Tests

#### `cli.test.ts`

Tests all CLI commands by mocking dependencies and verifying correct SDK function calls:

- `login` command - authentication flow
- `logout` command - credential removal
- `apps` command - listing applications (with `ls` alias)
- `balance` command - account balance display
- `payment` command - payment link generation
- Help and version commands
- Authentication requirement enforcement
- Error handling scenarios

### 3. Integration Tests

#### `integration.test.ts`

Tests the complete workflow against a real server:

- Full user workflow (auth → balance → apps → payments)
- Real API response validation
- Error scenarios with live server
- Performance testing (concurrent requests)
- Authentication error handling
- Network error handling

## Test Infrastructure

### `setup.ts`

Global test setup that:

- Starts the Echo server before tests
- Configures test environment variables
- Mocks keytar for secure storage
- Cleans up server after tests
- Provides test constants and utilities

### `run-tests.ts`

Standalone test runner that:

- Orchestrates server startup
- Waits for server readiness
- Runs Jest tests
- Provides CLI options for different test scenarios
- Ensures proper cleanup

## Running Tests

### Prerequisites

1. Ensure the Echo server is configured and can run
2. Install dependencies: `pnpm install`
3. Build the TypeScript: `pnpm run build`

### Test Commands

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm run test:coverage

# Run only unit tests (auth + client)
pnpm run test:unit

# Run only CLI tests
pnpm run test:cli

# Run only integration tests
pnpm run test:integration

# Run all test types sequentially
pnpm run test:all

# Run tests in watch mode
pnpm run test:watch

# Run tests for CI
pnpm run test:ci
```

### Running Individual Test Suites

```bash
# Run specific test file
npx jest auth.test.ts

# Run tests matching pattern
npx jest --testNamePattern="authentication"

# Run with verbose output
npx jest --verbose

# Run integration tests with server
npx ts-node src/__tests__/run-tests.ts
```

## Test Configuration

### Environment Variables

The tests use the following environment variables:

- `TEST_SERVER_PORT`: Port for test server (default: 3001)
- `ECHO_BASE_URL`: Base URL for API calls
- `NODE_ENV`: Set to 'test' during testing

### Mocking Strategy

1. **Unit Tests**: Mock external dependencies (keytar, axios)
2. **CLI Tests**: Mock SDK functions and CLI dependencies (inquirer, open)
3. **Integration Tests**: Use real server, minimal mocking

## Test Data

### Mock API Keys

- Valid: `echo_test_api_key_12345`
- Invalid: `invalid_key`

### Test Scenarios

Each test file covers:

- ✅ Happy path scenarios
- ❌ Error conditions
- 🔀 Edge cases
- 🔄 Integration workflows

## Coverage Goals

The test suite aims for:

- **95%+ line coverage** across all modules
- **100% function coverage** for public APIs
- **90%+ branch coverage** for conditional logic

## Debugging Tests

### Common Issues

1. **Server not starting**: Check if port 3001 is available
2. **Timeout errors**: Increase timeout in Jest config
3. **Mock issues**: Ensure mocks are properly cleared between tests

### Debug Commands

```bash
# Run with debug output
DEBUG=* pnpm test

# Run single test with full output
npx jest --verbose --no-coverage auth.test.ts

# Run integration tests with server logs
npx ts-node src/__tests__/run-tests.ts --verbose
```

## Contributing

When adding new CLI functionality:

1. Add unit tests for SDK functions
2. Add CLI tests for command behavior
3. Add integration tests for end-to-end workflows
4. Update this README with new test descriptions

### Test Naming Convention

```typescript
describe('Feature Name', () => {
  describe('Sub-feature', () => {
    it('should do something specific', () => {
      // test implementation
    });
  });
});
```

## Performance Benchmarks

The integration tests include performance benchmarks:

- Concurrent requests should complete within 10 seconds
- Sequential requests should be fast and reliable
- Memory usage should remain stable during test runs

## CI/CD Integration

The test suite is designed for CI/CD environments:

- Non-interactive mode
- Proper exit codes
- Coverage reporting
- Parallel test execution support
- Deterministic test results
