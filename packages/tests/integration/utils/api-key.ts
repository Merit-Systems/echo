import { createHmac } from 'crypto';

const API_KEY_HASH_SECRET =
  process.env.API_KEY_HASH_SECRET ||
  'change-this-in-production-very-secret-key';

export function hashApiKey(apiKey: string): string {
  if (apiKey.length === 0) {
    throw new Error('API key must be a non-empty string');
  }

  return createHmac('sha256', API_KEY_HASH_SECRET).update(apiKey).digest('hex');
}
