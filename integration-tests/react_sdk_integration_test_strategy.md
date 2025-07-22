# Echo Integration Test Strategy

**Status**: Phase 1 Infrastructure ✅ Complete | Phase 2 OAuth Protocol Tests 🚧 In Progress

**Note**: This strategy document has been updated to reflect the new **monorepo root architecture**. Integration tests now live at `echo/integration-tests/` to support testing across all SDKs (React, TypeScript, future Python, etc.) with shared infrastructure.

## Implementation Checklist

### Phase 1: Monorepo Integration Test Infrastructure ✅ COMPLETED

- [x] **Create `echo/integration-tests/` directory** at monorepo root
- [x] **Set up shared package.json** with common test dependencies (Vitest, Playwright, React Testing Library)
- [x] **Create centralized environment variable configuration** with .env file hierarchy
- [x] **Set up Docker Compose configuration** for all services (echo-control, postgres, test runners)
- [x] **Configure PostgreSQL database** with Prisma migrations and integration test seeding
- [x] **Implement smart environment detection** for local/CI environments
- [x] **Create shared test utilities** and helper functions for all SDKs
- [ ] ~~**Set up GitHub Actions workflow** with encrypted secrets management~~ (Removed from scope)

### Phase 2: OAuth Protocol Core Tests (Service-Agnostic) 🚧 IN PROGRESS

- [x] **OAuth 2.0 compliance tests** against real echo-control endpoints
- [x] **PKCE security validation** with real cryptographic operations
- [x] **JWT token lifecycle tests** with actual signing/verification
- [ ] **Authorization code flow tests** end-to-end
- [ ] **Refresh token rotation tests** with database persistence
- [ ] **Error handling scenarios** with actual HTTP error responses
- [ ] **Security attack simulation** (CSRF, redirect manipulation, scope escalation)

### Phase 3: React SDK Integration Tests

- [ ] **EchoProvider component integration** with real echo-control API
- [ ] **OAuth callback processing** with real authorization codes
- [ ] **Balance fetching integration** with JWT token validation
- [ ] **Payment link creation** with authenticated API calls
- [ ] **Session management** with real token storage and cleanup
- [ ] **Error boundary testing** with actual API failures
- [ ] **Component state synchronization** with real authentication events

### Phase 4: Cross-SDK Integration Tests

- [ ] **TypeScript SDK + React SDK interoperability** testing
- [ ] **Shared authentication state** across different SDK implementations
- [ ] **API consistency validation** between SDK implementations
- [ ] **Common error handling patterns** verification
- [ ] **Performance comparison** between different SDK approaches

### Phase 5: End-to-End Browser Tests (Playwright)

- [ ] **Complete OAuth flow** with real browser automation
- [ ] **Silent renewal testing** in iframe scenarios with real tokens
- [ ] **Cross-tab session synchronization** using real browser storage
- [ ] **Mobile/responsive testing** across device types
- [ ] **Performance testing** under realistic network conditions
- [ ] **Accessibility testing** for OAuth flows

### Phase 6: CI/CD Integration & Production Readiness

- [ ] **GitHub Actions pipeline** for all integration test categories
- [ ] **Parallel test execution** for different SDK test suites
- [ ] **Test result aggregation** and reporting across all services
- [ ] **Performance benchmarking** and regression detection
- [ ] **Security scanning** integration with test pipeline

---

## High-Level Strategy

**Goal**: Create a comprehensive integration testing framework at the monorepo root that validates OAuth2 + PKCE flows across all Echo SDKs (React, TypeScript, future Python) with real echo-control infrastructure, while maintaining fast CI execution and clear test organization.

## Architecture Overview

```mermaid
graph TB
    subgraph "Monorepo Structure"
        subgraph "echo/integration-tests/"
            IT[Integration Test Framework]
            OAUTH[OAuth Protocol Tests]
            REACT[React SDK Tests]
            TS[TypeScript SDK Tests]
            CROSS[Cross-SDK Tests]
            E2E[E2E Browser Tests]
        end

        subgraph "Individual SDKs"
            RSK[echo-react-sdk<br/>Unit Tests Only]
            TSK[echo-typescript-sdk<br/>Unit Tests Only]
            ESK[echo-server<br/>Unit Tests Only]
        end
    end

    subgraph "Test Infrastructure"
        subgraph "Docker Services"
            PG[PostgreSQL Test DB]
            EC[echo-control:test]
            WEB[Playwright Browsers]
        end

        subgraph "Shared Utilities"
            AUTH[Auth Helpers]
            DATA[Test Data Factory]
            API[API Clients]
        end
    end

    IT --> EC
    IT --> PG
    IT --> AUTH
    IT --> DATA
    E2E --> WEB
    WEB --> EC
    EC --> PG

    RSK -.-> IT
    TSK -.-> IT
    ESK -.-> IT
```

## Testing Categories & Approach

### 1. **API-Level Integration Tests** (Headless - No Browser)

_Test real HTTP calls between services using fetch/axios_

#### OAuth Core Flows

- [ ] **Authorization Code Generation**

  - ✅ Real: echo-control OAuth endpoint validation
  - ✅ Real: PKCE challenge/verifier generation & validation
  - ✅ Real: Client ID validation against DB
  - ✅ Real: Redirect URI allowlist validation
  - 🚫 Mock: User authentication (skip Clerk login)

- [ ] **Token Exchange Flow**

  - ✅ Real: Authorization code → Access Token exchange
  - ✅ Real: JWT signing with real secrets
  - ✅ Real: Refresh token generation & rotation
  - ✅ Real: Database token storage/retrieval
  - 🚫 Mock: External provider calls (if any)

- [ ] **Token Validation**
  - ✅ Real: JWT signature verification
  - ✅ Real: Token expiration handling
  - ✅ Real: Scope validation
  - ✅ Real: API calls with Bearer tokens

#### Security Scenarios

- [ ] **PKCE Attack Prevention**

  - ✅ Real: Code challenge/verifier validation
  - ✅ Real: Replay attack prevention
  - ✅ Real: Code interception scenarios

- [ ] **OAuth Security**
  - ✅ Real: State parameter CSRF protection
  - ✅ Real: Redirect URI manipulation attempts
  - ✅ Real: Client impersonation attempts
  - ✅ Real: Scope escalation prevention

### 2. **End-to-End Browser Tests** (Playwright/Cypress)

_Test complete user journeys with real browser automation_

#### Critical User Flows

- [ ] **First-Time OAuth Flow**

  - ✅ Real: Complete browser-based OAuth redirect
  - ✅ Real: User consent/authorization simulation
  - ✅ Real: Callback handling & token storage
  - 🚫 Mock: Clerk user authentication (test user)

- [ ] **Silent Renewal**

  - ✅ Real: Iframe-based silent renewal
  - ✅ Real: Token refresh without user interaction
  - ✅ Real: Fallback to login when renewal fails

- [ ] **Session Management**
  - ✅ Real: Cross-tab session synchronization
  - ✅ Real: Logout flow & token cleanup
  - ✅ Real: Expired session handling

### 3. **Component Integration Tests** (React Testing Library + Real API)

_Test React components with real API calls but no browser_

#### EchoProvider Integration

- [ ] **Authentication State Management**
  - ✅ Real: OAuth callback processing
  - ✅ Real: User profile loading from API
  - ✅ Real: Balance fetching with real tokens
  - 🚫 Mock: Browser redirect (use test utilities)

## Detailed Test Categories

### Category A: OAuth Protocol Compliance

```typescript
describe('OAuth 2.0 Protocol Compliance', () => {
  // Test against real echo-control instance
  test('authorization endpoint validates all required parameters');
  test('token endpoint follows RFC 6749 exactly');
  test('error responses match OAuth 2.0 specification');
  test('PKCE implementation follows RFC 7636');
});
```

### Category B: Security & Attack Prevention

```typescript
describe('OAuth Security Testing', () => {
  test('prevents authorization code interception attacks');
  test('validates PKCE code verifier correctly');
  test('prevents redirect URI manipulation');
  test('enforces client-specific redirect URI allowlists');
  test('prevents CSRF attacks via state parameter');
});
```

### Category C: Token Lifecycle Management

```typescript
describe('JWT Token Lifecycle', () => {
  test('generates valid JWT tokens with correct claims');
  test('validates token expiration in real time');
  test('handles refresh token rotation correctly');
  test('revokes tokens on logout');
  test('prevents token replay attacks');
});
```

### Category D: API Integration

```typescript
describe('Echo API Integration', () => {
  test('balance API requires valid JWT token');
  test('payment link creation validates authentication');
  test('API calls fail gracefully with expired tokens');
  test('token refresh happens automatically on 401');
});
```

### Category E: Cross-Browser Compatibility

```typescript
describe('Browser Compatibility', () => {
  test('OAuth flow works in Chrome');
  test('OAuth flow works in Firefox');
  test('OAuth flow works in Safari');
  test('silent renewal works across browsers');
});
```

## Mock vs Real Decision Matrix

| Component                    | Integration Tests  | E2E Tests | Reason                              |
| ---------------------------- | ------------------ | --------- | ----------------------------------- |
| echo-control OAuth endpoints | ✅ Real            | ✅ Real   | Core functionality under test       |
| PostgreSQL database          | ✅ Real            | ✅ Real   | Data persistence critical           |
| JWT token generation         | ✅ Real            | ✅ Real   | Crypto operations must be real      |
| Clerk user authentication    | 🚫 Mock            | 🚫 Mock   | External dependency, use test users |
| Browser redirects            | 🚫 Mock (API only) | ✅ Real   | Integration = API, E2E = full flow  |
| Network timeouts/failures    | 🚫 Mock            | 🚫 Mock   | Use MSW for network simulation      |
| Stripe webhooks              | 🚫 Mock            | 🚫 Mock   | External payment system             |
| SMTP email sending           | 🚫 Mock            | 🚫 Mock   | External service                    |

## Test Infrastructure Requirements

### Environment Variable Management (SOTA Approach)

#### **1. Centralized Configuration Strategy**

We use a hierarchical `.env` file approach for managing the complex environment requirements:

```bash
echo-react-sdk/
├── .env.integration              # Default integration settings (committed)
├── .env.integration.local        # Local developer overrides (gitignored)
├── .env.integration.ci           # CI-specific settings (committed)
└── scripts/load-test-env.ts      # Environment loader with validation
```

#### **2. Complete Environment Configuration**

```bash
# .env.integration - Integration test environment variables

# Test Database (Prisma + PostgreSQL)
DATABASE_URL=postgresql://test:test@localhost:5433/echo_integration_test
TEST_DB_NAME=echo_integration_test
TEST_DB_USER=test
TEST_DB_PASSWORD=test
TEST_DB_HOST=localhost
TEST_DB_PORT=5433

# Echo Control Test Instance
ECHO_CONTROL_URL=http://localhost:3001
ECHO_CONTROL_INTERNAL_URL=http://echo-control-test:3000
NODE_ENV=test

# Mock External Services
CLERK_SECRET_KEY=test_sk_clerk_mock_key_12345
CLERK_PUBLISHABLE_KEY=test_pk_clerk_mock_key_12345
NEXTAUTH_URL=http://localhost:3001

# Stripe Test Keys (real test keys, not mocks)
STRIPE_SECRET_KEY=sk_test_51234567890
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890
STRIPE_WEBHOOK_SECRET=whsec_test_12345

# JWT Configuration
JWT_SECRET=test-jwt-secret-integration-only-cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=echo-proxy

# Test-specific Settings
INTEGRATION_TEST_MODE=true
LOG_LEVEL=error
DISABLE_RATE_LIMITING=true
SKIP_EMAIL_VERIFICATION=true

# Browser Testing
HEADLESS=true
BROWSER_TIMEOUT=30000
```

#### **3. Smart Environment Loading**

```typescript
// scripts/load-test-env.ts
import { config } from 'dotenv';
import { resolve } from 'path';

export function loadIntegrationTestEnv() {
  // Load in order of precedence (last one wins)
  const envFiles = [
    '.env.integration', // Default integration settings
    '.env.integration.local', // Local overrides (gitignored)
    '.env.integration.ci', // CI-specific overrides
  ];

  for (const envFile of envFiles) {
    const envPath = resolve(process.cwd(), envFile);
    try {
      config({ path: envPath });
      console.log(`✅ Loaded ${envFile}`);
    } catch (error) {
      console.log(`⚠️  ${envFile} not found (optional)`);
    }
  }

  // Validate required environment variables
  const requiredVars = [
    'DATABASE_URL',
    'ECHO_CONTROL_URL',
    'JWT_SECRET',
    'CLERK_SECRET_KEY',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
```

### Monorepo Integration Test Directory Structure

```bash
echo/
├── integration-tests/                   # ← New monorepo root integration tests
│   ├── package.json                     # Shared test dependencies
│   ├── .env.integration                 # Default integration settings
│   ├── .env.integration.local           # Local overrides (gitignored)
│   ├── .env.integration.ci              # CI-specific settings
│   ├── docker/
│   │   ├── docker-compose.yml           # All services for integration tests
│   │   └── init-test-db.sql
│   ├── scripts/
│   │   ├── setup-integration-env.sh
│   │   ├── teardown-integration-env.sh
│   │   └── load-test-env.ts
│   ├── config/
│   │   ├── vitest.config.ts             # Shared Vitest configuration
│   │   └── playwright.config.ts         # Shared Playwright configuration
│   ├── utils/                           # Shared test utilities across all SDKs
│   │   ├── auth-helpers.ts              # OAuth flow helpers
│   │   ├── api-client.ts                # echo-control API client
│   │   ├── test-data-factory.ts         # Test data creation utilities
│   │   └── browser-helpers.ts           # Playwright utilities
│   └── tests/
│       ├── oauth-protocol/              # Core OAuth2 compliance (service-agnostic)
│       │   ├── authorization-flow.test.ts
│       │   ├── token-exchange.test.ts
│       │   ├── pkce-security.test.ts
│       │   └── jwt-validation.test.ts
│       ├── react-sdk/                   # React SDK specific integration tests
│       │   ├── echo-provider.integration.test.tsx
│       │   ├── oauth-callback.test.tsx
│       │   ├── balance-api.test.tsx
│       │   ├── payment-flows.test.tsx
│       │   └── session-management.test.tsx
│       ├── typescript-sdk/              # TypeScript SDK specific tests
│       │   ├── client-integration.test.ts
│       │   ├── cli-commands.test.ts
│       │   └── api-methods.test.ts
│       ├── cross-sdk/                   # Multi-SDK interoperability tests
│       │   ├── sdk-interop.test.ts
│       │   └── shared-auth-state.test.ts
│       └── e2e/                         # End-to-end browser tests
│           ├── oauth-flow.spec.ts
│           ├── silent-renewal.spec.ts
│           └── cross-tab-sync.spec.ts
├── echo-control/                        # Backend (unchanged)
├── echo-react-sdk/                      # React SDK with unit tests only
│   ├── package.json                     # Updated scripts to reference integration-tests
│   └── __tests__/
│       └── unit/                        # MSW-mocked unit tests only
├── echo-typescript-sdk/                 # TypeScript SDK with unit tests only
└── echo-server/                         # Server with unit tests only
```

### Docker Services with Monorepo Support

```yaml
# integration-tests/docker/docker-compose.yml
version: '3.8'

services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${TEST_DB_NAME}
      POSTGRES_USER: ${TEST_DB_USER}
      POSTGRES_PASSWORD: ${TEST_DB_PASSWORD}
    ports:
      - '${TEST_DB_PORT}:5432'
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${TEST_DB_USER} -d ${TEST_DB_NAME}']
      interval: 5s
      timeout: 5s
      retries: 5

  echo-control-test:
    build:
      context: ../echo-control # Relative to monorepo root
      dockerfile: Dockerfile.test
    environment:
      - DATABASE_URL
      - NODE_ENV=test
      - INTEGRATION_TEST_MODE=true
      - CLERK_SECRET_KEY
      - JWT_SECRET
      - JWT_ISSUER
      - JWT_AUDIENCE
      - LOG_LEVEL=error
      - DISABLE_RATE_LIMITING=true
    ports:
      - '3001:3000'
    depends_on:
      postgres-test:
        condition: service_healthy
    command: |
      sh -c "
        echo 'Running Prisma migrations...' &&
        npx prisma migrate deploy &&
        echo 'Seeding integration test data...' &&
        INTEGRATION_TEST_MODE=true npx prisma db seed &&
        echo 'Starting echo-control in test mode...' &&
        npm run start:test
      "
    healthcheck:
      test: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1']
      interval: 10s
      timeout: 5s
      retries: 5

  playwright:
    image: mcr.microsoft.com/playwright:v1.40.0-focal
    environment:
      - ECHO_CONTROL_URL=http://echo-control-test:3000
    volumes:
      - ../integration-tests:/workspace # Mount integration-tests directory
    working_dir: /workspace
    depends_on:
      echo-control-test:
        condition: service_healthy
    command: npx playwright test
    profiles:
      - e2e # Only start for E2E tests

volumes:
  postgres_test_data:
```

### Monorepo GitHub Actions Pipeline

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  pull_request:
    paths:
      - 'echo-control/**'
      - 'echo-react-sdk/**'
      - 'echo-typescript-sdk/**'
      - 'integration-tests/**'
  push:
    branches: [main]

jobs:
  oauth-protocol-tests:
    name: OAuth Protocol Compliance Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_USER: test
          POSTGRES_DB: echo_integration_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
        ports:
          - 5433:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: |
          cd integration-tests
          pnpm install --frozen-lockfile

      - name: Load test environment
        run: |
          cd integration-tests
          cp .env.integration.ci .env.integration.local
        env:
          DATABASE_URL: postgresql://test:test@localhost:5433/echo_integration_test
          JWT_SECRET: ${{ secrets.TEST_JWT_SECRET }}
          CLERK_SECRET_KEY: ${{ secrets.TEST_CLERK_SECRET_KEY }}
          STRIPE_SECRET_KEY: ${{ secrets.TEST_STRIPE_SECRET_KEY }}

      - name: Setup Prisma database
        run: |
          cd echo-control
          npx prisma migrate deploy
          INTEGRATION_TEST_MODE=true npx prisma db seed

      - name: Start echo-control test server
        run: |
          cd echo-control
          npm run build:test
          npm run start:test &
          timeout 60 bash -c 'until curl -f http://localhost:3001/api/health; do sleep 2; done'
        env:
          DATABASE_URL: postgresql://test:test@localhost:5433/echo_integration_test
          INTEGRATION_TEST_MODE: true

      - name: Run OAuth Protocol Tests
        run: |
          cd integration-tests
          pnpm test:oauth-protocol

  react-sdk-integration:
    name: React SDK Integration Tests
    runs-on: ubuntu-latest
    needs: oauth-protocol-tests

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_USER: test
          POSTGRES_DB: echo_integration_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
        ports:
          - 5433:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: |
          cd integration-tests
          pnpm install --frozen-lockfile

      - name: Load test environment
        run: |
          cd integration-tests
          cp .env.integration.ci .env.integration.local
        env:
          DATABASE_URL: postgresql://test:test@localhost:5433/echo_integration_test
          JWT_SECRET: ${{ secrets.TEST_JWT_SECRET }}
          CLERK_SECRET_KEY: ${{ secrets.TEST_CLERK_SECRET_KEY }}

      - name: Setup test environment
        run: |
          cd echo-control
          npx prisma migrate deploy
          INTEGRATION_TEST_MODE=true npx prisma db seed
          npm run build:test
          npm run start:test &
          timeout 60 bash -c 'until curl -f http://localhost:3001/api/health; do sleep 2; done'
        env:
          DATABASE_URL: postgresql://test:test@localhost:5433/echo_integration_test
          INTEGRATION_TEST_MODE: true

      - name: Run React SDK Integration Tests
        run: |
          cd integration-tests
          pnpm test:react-sdk

  typescript-sdk-integration:
    name: TypeScript SDK Integration Tests
    runs-on: ubuntu-latest
    needs: oauth-protocol-tests

    # Similar setup to react-sdk-integration...
    steps:
      # ... setup steps
      - name: Run TypeScript SDK Integration Tests
        run: |
          cd integration-tests
          pnpm test:typescript-sdk

  cross-sdk-tests:
    name: Cross-SDK Integration Tests
    runs-on: ubuntu-latest
    needs: [react-sdk-integration, typescript-sdk-integration]

    # Similar setup...
    steps:
      # ... setup steps
      - name: Run Cross-SDK Tests
        run: |
          cd integration-tests
          pnpm test:cross-sdk

  e2e-tests:
    name: End-to-End Browser Tests
    runs-on: ubuntu-latest
    needs: cross-sdk-tests

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install Playwright browsers
        run: |
          cd integration-tests
          pnpm install --frozen-lockfile
          npx playwright install --with-deps

      - name: Start test environment with Docker
        run: |
          cd integration-tests
          cp .env.integration.ci .env.integration.local
          docker-compose -f docker/docker-compose.yml up -d
          timeout 120 bash -c 'until docker-compose -f docker/docker-compose.yml ps | grep healthy; do sleep 5; done'
        env:
          JWT_SECRET: ${{ secrets.TEST_JWT_SECRET }}
          CLERK_SECRET_KEY: ${{ secrets.TEST_CLERK_SECRET_KEY }}

      - name: Run E2E Tests
        run: |
          cd integration-tests
          pnpm test:e2e

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: integration-tests/playwright-report/
```

### Test Data Management with Prisma

```typescript
// scripts/seed-integration-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedIntegrationDatabase() {
  console.log('🌱 Seeding integration test database...');

  // Clean existing data
  await prisma.refreshToken.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.echoApp.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const testUser = await prisma.user.create({
    data: {
      id: 'test-user-456',
      email: 'test@example.com',
      name: 'Integration Test User',
      clerkUserId: 'user_clerk_test_123',
      credits: 1000,
    },
  });

  // Create test Echo apps (OAuth clients)
  const testApp = await prisma.echoApp.create({
    data: {
      id: 'test-client-123',
      name: 'Integration Test Client',
      description: 'OAuth client for integration testing',
      redirectUris: ['http://localhost:3000/callback'],
      allowedScopes: ['llm:invoke', 'offline_access'],
      userId: testUser.id,
    },
  });

  // Create test API keys
  await prisma.apiKey.create({
    data: {
      id: 'test-api-key-789',
      name: 'Integration Test API Key',
      keyHash: 'hashed-test-key',
      userId: testUser.id,
      echoAppId: testApp.id,
    },
  });

  console.log('✅ Integration test database seeded successfully');
}

// Add to package.json: "seed:integration": "tsx scripts/seed-integration-db.ts"
```

### Integration Test Package.json Configuration

```json
// integration-tests/package.json
{
  "name": "@echo/integration-tests",
  "version": "1.0.0",
  "private": true,
  "description": "Cross-SDK integration tests for Echo platform",
  "scripts": {
    "test": "vitest run tests/",
    "test:watch": "vitest tests/",
    "test:oauth-protocol": "vitest run tests/oauth-protocol/",
    "test:react-sdk": "vitest run tests/react-sdk/",
    "test:typescript-sdk": "vitest run tests/typescript-sdk/",
    "test:cross-sdk": "vitest run tests/cross-sdk/",
    "test:e2e": "playwright test tests/e2e/",
    "test:all": "pnpm test:oauth-protocol && pnpm test:react-sdk && pnpm test:typescript-sdk && pnpm test:cross-sdk",
    "env:setup": "./scripts/setup-integration-env.sh",
    "env:teardown": "./scripts/teardown-integration-env.sh",
    "env:reset": "docker-compose -f docker/docker-compose.yml down -v && pnpm env:setup",
    "docker:up": "docker-compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker-compose -f docker/docker-compose.yml down",
    "docker:logs": "docker-compose -f docker/docker-compose.yml logs -f"
  },
  "dependencies": {
    "@echo/react-sdk": "workspace:*",
    "@echo/typescript-sdk": "workspace:*"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "dotenv": "^16.0.0",
    "jsdom": "^23.0.0",
    "playwright": "^1.40.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

### Updated SDK Package.json Scripts

```json
// echo-react-sdk/package.json
{
  "scripts": {
    "test": "vitest run __tests__/unit/",
    "test:unit": "vitest run __tests__/unit/",
    "test:unit:watch": "vitest __tests__/unit/",
    "test:integration": "cd ../integration-tests && pnpm test:react-sdk",
    "test:integration:watch": "cd ../integration-tests && pnpm test:react-sdk --watch",
    "test:all": "pnpm test:unit && pnpm test:integration",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "build": "vite build",
    "dev": "vite"
  }
}

// echo-typescript-sdk/package.json
{
  "scripts": {
    "test": "vitest run __tests__/unit/",
    "test:unit": "vitest run __tests__/unit/",
    "test:integration": "cd ../integration-tests && pnpm test:typescript-sdk",
    "test:all": "pnpm test:unit && pnpm test:integration",
    "build": "tsc && tsc-alias",
    "dev": "tsc --watch"
  }
}
```

### Monorepo Smart Setup Script

```bash
#!/bin/bash
# integration-tests/scripts/setup-integration-env.sh

set -e

echo "🚀 Setting up Echo integration test environment..."

# Change to integration-tests directory
cd "$(dirname "$0")/.."

# Load environment configuration
source scripts/load-test-env.sh

# Detect environment
if [ "$CI" = "true" ]; then
    echo "📦 Running in CI environment"
    ENV_FILE=".env.integration.ci"
elif [ -f ".env.integration.local" ]; then
    echo "🏠 Using local integration environment"
    ENV_FILE=".env.integration.local"
else
    echo "🔧 Using default integration environment"
    ENV_FILE=".env.integration"
fi

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    export $(cat $ENV_FILE | grep -v '^#' | xargs)
    echo "✅ Loaded environment from $ENV_FILE"
else
    echo "❌ Environment file $ENV_FILE not found"
    exit 1
fi

# Start services based on environment
if [ "$CI" != "true" ]; then
    echo "🐳 Starting Docker services for integration tests..."
    docker-compose -f docker/docker-compose.yml up -d

    # Wait for services to be healthy
    echo "⏳ Waiting for services to be ready..."
    timeout 120 bash -c 'until docker-compose -f docker/docker-compose.yml ps | grep -q healthy; do sleep 5; done'
else
    echo "📦 CI environment detected - services managed by GitHub Actions"

    # In CI, manually start echo-control since it's not in Docker
    echo "🗃️ Setting up database for CI..."
    cd ../echo-control
    npx prisma migrate deploy
    INTEGRATION_TEST_MODE=true npx prisma db seed

    echo "🚀 Starting echo-control test server..."
    npm run build:test
    npm run start:test &

    # Wait for health check
    timeout 60 bash -c 'until curl -f http://localhost:3001/api/health; do sleep 2; done'

    cd ../integration-tests
fi

echo "✅ Integration environment ready!"
echo ""
echo "Available test commands:"
echo "  pnpm test:oauth-protocol  - OAuth2 compliance tests"
echo "  pnpm test:react-sdk       - React SDK integration tests"
echo "  pnpm test:typescript-sdk  - TypeScript SDK integration tests"
echo "  pnpm test:cross-sdk       - Cross-SDK interoperability tests"
echo "  pnpm test:e2e             - End-to-end browser tests"
echo "  pnpm test:all             - Run all integration tests"
```

### Environment Loading Script

```typescript
// integration-tests/scripts/load-test-env.ts
import { config } from 'dotenv';
import { resolve } from 'path';

export function loadIntegrationTestEnv() {
  console.log('🔧 Loading integration test environment...');

  // Load in order of precedence (last one wins)
  const envFiles = [
    '.env.integration', // Default integration settings
    '.env.integration.local', // Local overrides (gitignored)
    '.env.integration.ci', // CI-specific overrides
  ];

  for (const envFile of envFiles) {
    const envPath = resolve(process.cwd(), envFile);
    try {
      config({ path: envPath });
      console.log(`✅ Loaded ${envFile}`);
    } catch (error) {
      console.log(`⚠️  ${envFile} not found (optional)`);
    }
  }

  // Validate required environment variables
  const requiredVars = [
    'DATABASE_URL',
    'ECHO_CONTROL_URL',
    'JWT_SECRET',
    'CLERK_SECRET_KEY',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  console.log('✅ All required environment variables loaded');
  console.log(`🎯 Echo Control URL: ${process.env.ECHO_CONTROL_URL}`);
  console.log(
    `🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1] || 'Unknown'}`
  );
}

// Auto-load when imported
if (typeof require !== 'undefined' && require.main === module) {
  loadIntegrationTestEnv();
}
```

## Test Execution Strategy

### 1. **Fast Feedback Loop**

```bash
# Unit tests (30s) - Run on every commit
pnpm test:unit

# Integration tests (2-3 min) - Run on PR
pnpm test:integration

# E2E tests (5-10 min) - Run on merge to main
pnpm test:e2e
```

### 2. **Parallel Execution**

- Run integration tests in parallel with different client configurations
- Use database schemas/namespaces for isolation
- Playwright parallel execution for browser tests

### 3. **CI Pipeline Stages**

1. **Unit Tests**: MSW mocked tests (existing)
2. **Integration Tests**: Real services, no browser
3. **E2E Tests**: Full browser automation
4. **Security Tests**: Penetration testing scenarios

## Success Metrics

- [ ] **Coverage**: 90%+ of OAuth flows covered by integration tests
- [ ] **Performance**: Integration test suite completes in < 5 minutes
- [ ] **Reliability**: < 1% flaky test rate in CI
- [ ] **Security**: All OWASP OAuth threats covered by tests

This plan ensures we test the most critical OAuth flows with real infrastructure while maintaining fast CI execution through strategic mocking of external dependencies.

## Environment Variable Benefits

This SOTA approach provides:

✅ **Centralized Configuration** - All env vars in one place per environment  
✅ **Environment Isolation** - Different configs for local/CI/production  
✅ **Secret Management** - Sensitive values in GitHub Secrets  
✅ **Developer Experience** - Simple `pnpm test:integration` command  
✅ **CI/CD Ready** - Automatic environment detection and setup  
✅ **Cross-Platform** - Works on Windows/Mac/Linux  
✅ **Type Safety** - Environment validation with clear error messages  
✅ **Prisma Integration** - Real database migrations and seeding

## Implementation Notes

### Phase Execution Approach

Each phase should be completed and tested before moving to the next. After each phase:

1. **Verify all tests pass** in the current phase
2. **Run existing unit tests** to ensure no regressions
3. **Update CI pipeline** to include new test categories
4. **Validate environment configuration** works in all environments
5. **Document any blockers** or architectural changes needed
6. **Get stakeholder review** before proceeding to next phase

### Infrastructure Dependencies

- **Docker Desktop** or equivalent container runtime
- **PostgreSQL 15+** for test database with Prisma support
- **Node.js 20+** for both echo-control and echo-react-sdk
- **Playwright browsers** for E2E testing
- **GitHub Actions** with encrypted secrets management
- **pnpm** for consistent package management

### Security Considerations

- All test credentials should be **non-production** values
- Test database should be **isolated** from any production systems
- JWT secrets should be **test-specific** and rotated regularly
- Integration tests should **never hit production APIs**
- Environment files with secrets must be **gitignored** properly
- CI secrets should use **GitHub encrypted secrets**

### Prisma-Specific Benefits

- **Real Database Constraints** - Foreign keys, unique constraints, triggers tested
- **Migration Validation** - Ensure schema changes work with real PostgreSQL
- **Seed Data Consistency** - Reliable test data across environments
- **Transaction Testing** - Real ACID properties and rollback behavior
- **Query Performance** - Test actual SQL queries generated by Prisma

This strategy provides a systematic approach to building confidence in the OAuth integration while maintaining developer velocity and CI performance through modern environment management practices.
