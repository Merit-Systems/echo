import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment files in order (last wins)
function loadEnvironment() {
  // 1. Base test environment
  dotenv.config({ path: resolve(__dirname, '../.env.test') });

  // 2. Local overrides (gitignored)
  dotenv.config({
    path: resolve(__dirname, '../.env.test.local'),
    override: true,
  });
}

// Initialize environment loading
loadEnvironment();

// Validate required environment variables
const requiredVars = [
  'DATABASE_URL',
  'ECHO_CONTROL_URL',
  'JWT_SECRET',
  'INTEGRATION_TEST_JWT',
  'AUTH_SECRET',
];

const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please ensure .env.test and/or .env.test.local are properly configured.`
  );
}

// Parse database URL to extract components if needed
function parseDatabaseUrl(url: string) {
  const regex = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const match = url.match(regex);

  if (!match) {
    throw new Error(`Invalid DATABASE_URL format: ${url}`);
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]!, 10),
    database: match[5],
  };
}

const dbComponents = parseDatabaseUrl(process.env.DATABASE_URL!);

// Central test configuration object
export const TEST_CONFIG = {
  // Database configuration
  database: {
    url: process.env.DATABASE_URL!,
    name: dbComponents.database,
    host: dbComponents.host,
    port: dbComponents.port,
    user: dbComponents.user,
    password: dbComponents.password,
  },

  // Service URLs
  services: {
    echoControl: process.env.ECHO_CONTROL_URL!,
    // Docker internal URL (used in docker-compose environment overrides)
    echoControlInternal: 'http://echo-control-test:3000',
    // Echo data server URLs
    echoDataServer: process.env.ECHO_DATA_SERVER_URL || 'http://localhost:3069',
    echoDataServerInternal: 'http://echo-data-server-test:3069',
  },

  // Authentication configuration
  auth: {
    // JWT configuration
    jwtSecret: process.env.JWT_SECRET!,
    jwtIssuer: process.env.JWT_ISSUER || process.env.ECHO_CONTROL_URL!,
    jwtAudience: process.env.JWT_AUDIENCE || 'echo-proxy',

    // Integration test JWT (pre-generated for testing)
    integrationJwt: process.env.INTEGRATION_TEST_JWT!,

    integrationJwtForUser2: process.env.INTEGRATION_TEST_JWT_USER_2!,

    // Echo Control application base URL
    echoControlAppBaseUrl:
      process.env.ECHO_CONTROL_APP_BASE_URL || process.env.ECHO_CONTROL_URL!,

    // OAuth refresh token expiry seconds
    oauthRefreshTokenExpirySeconds:
      process.env.OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS || 30 * 24 * 60 * 60,

    // OAuth access token expiry seconds
    oauthAccessTokenExpirySeconds:
      process.env.OAUTH_ACCESS_TOKEN_EXPIRY_SECONDS || 24 * 60 * 60,
  },

  // Test environment settings
  test: {
    timeout: 30000,
    headless: process.env.HEADLESS !== 'false',
    browserTimeout: process.env.CI === 'true' ? 60000 : 30000,
    disableRateLimit: true,
    skipEmailVerification: true,
    logLevel: process.env.LOG_LEVEL || 'error',
  },

  // Payment configuration (optional)
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // Environment flags
  environment: {
    nodeEnv: process.env.NODE_ENV || 'test',
    integrationTestMode: process.env.INTEGRATION_TEST_MODE === 'true',
    ci: process.env.CI === 'true',
  },
};

// Type safety for configuration
export type TestConfig = typeof TEST_CONFIG;

// Helper functions for common operations
export const configHelpers = {
  /**
   * Get database URL for Docker environment
   */
  getDockerDatabaseUrl(): string {
    const { user, password, name } = TEST_CONFIG.database;
    return `postgresql://${user}:${password}@postgres-test:5432/${name}`;
  },

  /**
   * Check if running in CI environment
   */
  isCI(): boolean {
    return TEST_CONFIG.environment.ci;
  },

  /**
   * Check if running in Docker environment
   */
  isDocker(): boolean {
    return process.env.DOCKER_ENVIRONMENT === 'true';
  },

  /**
   * Get appropriate service URL based on environment
   */
  getServiceUrl(): string {
    return this.isDocker()
      ? TEST_CONFIG.services.echoControlInternal
      : TEST_CONFIG.services.echoControl;
  },
};
