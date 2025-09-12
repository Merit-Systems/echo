/**
 * OAuth configuration utilities
 */
import { env } from '@/env';
import { logger } from '@/logger';
import { addSeconds } from 'date-fns';

/**
 * Create a new Date object for refresh token expiry
 */
export function createEchoRefreshTokenExpiry(): Date {
  const expiry = addSeconds(new Date(), env.OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS);
  logger.emit({
    severityText: 'DEBUG',
    body: 'Echo refresh token expiry calculated',
    attributes: {
      expiryTime: expiry.toISOString(),
      function: 'createEchoRefreshTokenExpiry',
    },
  });
  return expiry;
}

export function createEchoAccessTokenExpiry(): Date {
  const expiry = addSeconds(new Date(), env.OAUTH_ACCESS_TOKEN_EXPIRY_SECONDS);
  logger.emit({
    severityText: 'DEBUG',
    body: 'Echo access token expiry calculated',
    attributes: {
      expiryTime: expiry.toISOString(),
      function: 'createEchoAccessTokenExpiry',
    },
  });
  return expiry;
}
