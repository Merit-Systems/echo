# Echo CLI Test Suite Validation

This document provides step-by-step instructions to validate that the comprehensive test suite is working correctly.

## Test Suite Overview

The comprehensive test suite includes:

1. **Unit Tests**: Test individual SDK functions in isolation

   - `auth.test.ts` - Authentication and API key management
   - `client.test.ts` - EchoClient SDK functionality

2. **CLI Tests**: Test CLI commands with mocked dependencies

   - `cli.test.ts` - All CLI commands and their behaviors

3. **Integration Tests**: Test against real server

   - `integration.test.ts` - End-to-end workflows

4. **Infrastructure**: Test setup and utilities
   - `setup.ts` - Global test configuration and server management
   - `run-tests.ts` - Standalone test runner

## Test Coverage

### SDK Client (`client.ts`)

✅ Authentication header inclusion
✅ Balance fetching (general and app-specific)
✅ Payment link creation
✅ Echo app listing and retrieval
✅ URL generation utilities
✅ Error handling (network, auth, timeout)

### Authentication (`auth.ts`)

✅ API key validation (format, length, prefix)
✅ Secure storage operations (store, retrieve, remove)
✅ Error handling for storage failures
✅ Integration scenarios

### CLI Commands (`cli.ts`)

✅ `login` - Complete authentication flow
✅ `logout` - Credential removal
✅ `apps` / `ls` - Application listing
✅ `balance` - Account balance display
✅ `payment` - Payment link generation
✅ Help and version information
✅ Authentication requirement enforcement
✅ Input validation and error handling

## Validation Steps

### 1. Verify Test Files Exist

```bash
ls -la src/__tests__/
```

Expected files:

- `auth.test.ts`
- `client.test.ts`
- `cli.test.ts`
- `integration.test.ts`
- `setup.ts`
- `run-tests.ts`
- `README.md`

### 2. Check Jest Configuration

```bash
cat jest.config.js
```

Should include:

- TypeScript preset
- Test setup file
- Coverage configuration
- Proper timeout settings

### 3. Verify Dependencies

```bash
npm list --depth=0
```

Should include:

- `jest`, `@types/jest`, `ts-jest`
- `dotenv`, `express`, `@types/express`
- All SDK dependencies

### 4. Run Unit Tests

```bash
npm run test:unit
```

This tests:

- Authentication module functionality
- SDK client functionality
- No server required

### 5. Run CLI Tests

```bash
npm run test:cli
```

This tests:

- All CLI commands
- Mocked dependencies
- No server required

### 6. Run Integration Tests

```bash
npm run test:integration
```

This tests:

- Real server communication
- End-to-end workflows
- Server auto-startup

### 7. Run All Tests with Coverage

```bash
npm run test:coverage
```

Expected coverage targets:

- Lines: 95%+
- Functions: 100%
- Branches: 90%+

### 8. Validate Test Scripts

```bash
npm run test:all
```

Should run all test types sequentially.

## Validation Checklist

### ✅ Test Infrastructure

- [ ] Jest configuration properly set up
- [ ] TypeScript compilation working
- [ ] Test dependencies installed
- [ ] Mock setup working correctly

### ✅ Unit Tests

- [ ] Authentication tests pass
- [ ] Client SDK tests pass
- [ ] No external dependencies required
- [ ] Proper error handling tested

### ✅ CLI Tests

- [ ] All CLI commands tested
- [ ] Interactive prompts mocked
- [ ] Error scenarios covered
- [ ] Help and version working

### ✅ Integration Tests

- [ ] Server starts automatically
- [ ] Real API calls working
- [ ] Performance tests pass
- [ ] Cleanup working properly

### ✅ Test Coverage

- [ ] Coverage reports generated
- [ ] Target coverage achieved
- [ ] All public APIs covered
- [ ] Error paths tested

## Troubleshooting

### Common Issues

1. **Server startup fails**

   ```bash
   # Check if port 3001 is available
   lsof -i :3001
   # Kill any processes using the port
   kill -9 <PID>
   ```

2. **TypeScript compilation errors**

   ```bash
   # Build TypeScript explicitly
   npm run build
   # Check for type errors
   npx tsc --noEmit
   ```

3. **Mock failures**

   ```bash
   # Clear Jest cache
   npx jest --clearCache
   # Run tests with verbose output
   npx jest --verbose
   ```

4. **Test timeouts**
   ```bash
   # Increase timeout in jest.config.js
   # Or run with longer timeout
   npx jest --testTimeout=60000
   ```

### Debug Commands

```bash
# Run tests with full output
npm test -- --verbose --no-coverage

# Run specific test file
npx jest auth.test.ts

# Run tests matching pattern
npx jest --testNamePattern="authentication"

# Debug server startup
npx ts-node src/__tests__/run-tests.ts --verbose
```

## Expected Test Results

When validation is successful, you should see:

```
Test Suites: 4 passed, 4 total
Tests:       50+ passed, 50+ total
Snapshots:   0 total
Time:        30-60s
Coverage:    95%+ lines, 100% functions
```

## Continuous Integration

The test suite is designed for CI/CD:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm run test:ci

# Example for separate test types
- name: Unit tests
  run: npm run test:unit
- name: CLI tests
  run: npm run test:cli
- name: Integration tests
  run: npm run test:integration
```

## Performance Expectations

- **Unit tests**: < 10 seconds
- **CLI tests**: < 20 seconds
- **Integration tests**: < 60 seconds (includes server startup)
- **Full suite**: < 90 seconds

## Maintenance

To maintain test quality:

1. **Add tests for new features**
2. **Update tests when APIs change**
3. **Monitor coverage reports**
4. **Keep dependencies updated**
5. **Review test performance regularly**

The test suite should be run:

- Before every commit
- On pull request creation
- Before releases
- Daily on CI/CD pipeline
