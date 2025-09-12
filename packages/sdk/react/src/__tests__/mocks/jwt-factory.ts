import jwt from 'jsonwebtoken';

// Use a string secret for jsonwebtoken
const TEST_JWT_SECRET =
  'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2';

interface JWTPayload {
  userId?: string;
  appId?: string;
  apiKeyId?: string;
  scope?: string;
  keyVersion?: number;
  [key: string]: unknown;
}

/**
 * Create a valid JWT token for testing
 */
export async function createValidJWT(
  overrides: JWTPayload = {}
): Promise<string> {
  const payload = {
    userId: 'test-user-123',
    appId: 'test-app-456',
    apiKeyId: 'test-key-789',
    scope: 'llm:invoke offline_access',
    keyVersion: 1,
    ...overrides,
  };

  const signOptions: jwt.SignOptions = {
    algorithm: 'HS256',
    audience: 'echo-proxy',
    issuer: 'http://localhost:3000',
  };

  // If exp is in overrides, don't use expiresIn
  if (!('exp' in overrides)) {
    signOptions.expiresIn = '24h';
  }

  return jwt.sign(payload, TEST_JWT_SECRET, signOptions);
}

/**
 * Create a JWT with tampered signature for security testing
 */
export async function createTamperedJWT(
  overrides: JWTPayload = {}
): Promise<string> {
  const validToken = await createValidJWT(overrides);
  // Tamper with the signature by replacing last 8 characters
  return validToken.slice(0, -8) + 'TAMPERED';
}

/**
 * Create an expired JWT token for testing
 */
export async function createExpiredJWT(
  overrides: JWTPayload = {}
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    userId: 'test-user-123',
    appId: 'test-app-456',
    scope: 'llm:invoke',
    aud: 'echo-proxy',
    iss: 'http://localhost:3000',
    iat: now - 3600, // 1 hour ago
    exp: now - 1800, // 30 minutes ago (expired)
    ...overrides,
  };

  return jwt.sign(payload, TEST_JWT_SECRET, {
    algorithm: 'HS256',
    noTimestamp: true, // We're setting iat manually
  });
}
