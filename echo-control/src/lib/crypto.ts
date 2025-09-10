import { createHmac, randomBytes, randomUUID } from 'crypto';

/**
 * Secret key for deterministic API key hashing
 * In production, this should be a strong random value from environment variables
 */
const API_KEY_HASH_SECRET =
  process.env.API_KEY_HASH_SECRET ??
  'change-this-in-production-very-secret-key';

/**
 * Hash an API key deterministically for O(1) database lookup
 * Uses HMAC-SHA256 for security while maintaining deterministic output
 * @param apiKey - The plaintext API key to hash
 * @returns string - The deterministic hash for database storage/lookup
 */
export function hashApiKey(apiKey: string): string {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('API key must be a non-empty string');
  }

  // Use HMAC-SHA256 for secure, deterministic hashing
  return createHmac('sha256', API_KEY_HASH_SECRET).update(apiKey).digest('hex');
}

// Generate a secure API key using UUID v4 and additional entropy
export function generateApiKey(): string {
  const prefix = process.env.API_KEY_PREFIX ?? 'echo_';

  // Use UUID v4 for structured randomness
  const uuidPart = randomUUID().replace(/-/g, '');

  // Add additional cryptographic entropy (16 bytes = 32 hex chars)
  const entropyPart = randomBytes(16).toString('hex');

  // Combine for maximum security: prefix + UUID + entropy
  return `${prefix}${uuidPart}${entropyPart}`;
}
