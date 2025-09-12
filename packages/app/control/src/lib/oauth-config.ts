/**
 * OAuth configuration utilities
 */
import { logger } from '@/logger';

/**
 * Get the refresh token expiry duration in seconds from environment variable
 * Checks OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS first, then OAUTH_REFRESH_TOKEN_EXPIRY_DAYS
 * Defaults to 30 days (2592000 seconds) if neither is set
 */
function getEchoRefreshTokenExpirySeconds(): number {
  // Check for seconds first (more granular control, useful for testing)
  const secondsEnv = process.env.OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS;
  logger.emit({
    severityText: 'DEBUG',
    body: 'Refresh token expiry seconds',
    attributes: {
      secondsEnv,
      function: 'getEchoRefreshTokenExpirySeconds',
    },
  });
  if (secondsEnv) {
    const parsed = parseInt(secondsEnv, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
    logger.emit({
      severityText: 'WARN',
      body: 'Invalid OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS value, falling back to default',
      attributes: {
        invalidValue: secondsEnv,
        function: 'getEchoRefreshTokenExpirySeconds',
      },
    });
  }
  // Default to 1 second
  return 1;
}

/**
 * Create a new Date object for refresh token expiry
 */
export function createEchoRefreshTokenExpiry(): Date {
  const expiry = new Date();
  const expirySeconds = getEchoRefreshTokenExpirySeconds();
  expiry.setTime(expiry.getTime() + expirySeconds * 1000); // multiply by 1000 to convert to milliseconds
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

function getEchoAccessTokenExpirySeconds(): number {
  const secondsEnv = process.env.OAUTH_ACCESS_TOKEN_EXPIRY_SECONDS;
  logger.emit({
    severityText: 'DEBUG',
    body: 'Access token expiry seconds',
    attributes: {
      secondsEnv,
      function: 'getEchoAccessTokenExpirySeconds',
    },
  });
  if (secondsEnv) {
    const parsed = parseInt(secondsEnv, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 1; // Default to 1 second
}

export function createEchoAccessTokenExpiry(): Date {
  const expiry = new Date();
  const expirySeconds = getEchoAccessTokenExpirySeconds();
  expiry.setTime(expiry.getTime() + expirySeconds * 1000);
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

/**
 * Get the grace period (in milliseconds) allowed for refreshing using an archived
 * refresh token. This enables a short overlap window during token rotation.
 *
 * Priority:
 * - OAUTH_REFRESH_TOKEN_ARCHIVE_GRACE_MS (milliseconds)
 * - OAUTH_REFRESH_TOKEN_ARCHIVE_GRACE_SECONDS (seconds)
 * - Default: 2 minutes in normal environments, 0 in test mode
 */
export function getArchivedRefreshTokenGraceMs(): number {
  const msEnv = process.env.OAUTH_REFRESH_TOKEN_ARCHIVE_GRACE_MS;
  if (msEnv) {
    const parsedMs = parseInt(msEnv, 10);
    if (!isNaN(parsedMs) && parsedMs >= 0) {
      return parsedMs;
    }
    logger.emit({
      severityText: 'WARN',
      body: 'Invalid OAUTH_REFRESH_TOKEN_ARCHIVE_GRACE_MS value, falling back to default',
      attributes: {
        invalidValue: msEnv,
        function: 'getArchivedRefreshTokenGraceMs',
      },
    });
  }

  // Default behavior: zero grace in local/integration tests, 2 minutes otherwise
  const isTestMode =
    process.env.INTEGRATION_TEST_MODE === 'true' ||
    process.env.NODE_ENV === 'test';
  return isTestMode ? 0 : 2 * 60 * 1000;
}
