# Integration Tests

This package contains integration tests for the Echo platform.

## Setup

1. Set up the test environment:
```bash
pnpm env:setup
```

2. Seed the test database:
```bash
pnpm db:seed
```

## Running Tests

Run all integration tests:
```bash
pnpm test:watch
```

Run specific test suites:
```bash
# Echo Data Server tests
pnpm test:echo-data-server

# OAuth Protocol tests
pnpm test:oauth-protocol
```

## Test Suites

### Echo Data Server Tests
Located in `tests/echo-data-server/`:
- `api-key.client.test.ts` - API key authentication and usage
- `402-auth.client.test.ts` - Payment required (402) authentication flow
- `echo-access-jwt.client.test.ts` - JWT token validation
- `free-tier.client.test.ts` - Free tier functionality
- `referral-code.client.test.ts` - Referral code creation and application
- `in-flight-requests.test.ts` - Concurrent request handling

### OAuth Protocol Tests
Located in `tests/oauth-protocol/`:
- OAuth authorization flow
- Token refresh and lifecycle
- PKCE security
- CSRF vulnerability testing

## Referral Code Tests

The referral code integration tests (`referral-code.client.test.ts`) cover:

1. **GET endpoint** - Retrieval of referral codes:
   - Retrieving an existing referral code for a user
   - Auto-creating a referral code for users who don't have one
   - Ensuring consistency across multiple requests

2. **POST endpoint** - Application of referral codes:
   - Successfully applying another user's referral code
   - Rejecting invalid referral codes
   - Preventing users from applying codes when they already have a referrer

### Test Data

Referral code test data is defined in `config/test-data.ts`:
- Primary user has referral code: `TEST-REFERRAL-CODE-PRIMARY`
- Secondary user has referral code: `TEST-REFERRAL-CODE-SECONDARY`
- Tertiary user has no referral code (created during tests)

## Database Management

Reset and reseed the database:
```bash
pnpm db:reset-and-seed
```

Reset only:
```bash
pnpm db:reset
```
