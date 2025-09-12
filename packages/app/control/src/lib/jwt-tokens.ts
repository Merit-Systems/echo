import { db } from '@/lib/db';
import {
  createEchoAccessTokenExpiry,
  createEchoRefreshTokenExpiry,
  getArchivedRefreshTokenGraceMs,
} from '@/lib/oauth-config';
import { PermissionService } from '@/lib/permissions/service';
import { AppRole, MembershipStatus } from '@/lib/permissions/types';
import { createHash } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import { logger } from '@/logger';

// JWT secret for API tokens (different from OAuth codes)
const API_ECHO_ACCESS_JWT_SECRET = new TextEncoder().encode(
  process.env.API_ECHO_ACCESS_JWT_SECRET ||
    'api-jwt-secret-change-in-production'
);

// JWT secret for verifying authorization codes (must match authorize endpoint)
const JWT_SECRET = new TextEncoder().encode(
  process.env.OAUTH_CODE_SIGNING_JWT_SECRET ||
    'your-secret-key-change-in-production'
);

interface ApiTokenPayload {
  user_id: string;
  app_id: string;
  scope: string;
  key_version: number;
  sid?: string;
  // Standard JWT claims
  sub: string; // user_id
  aud: string; // app_id
  exp: number;
  iat: number;
  jti: string; // unique token ID
}

interface AuthCodePayload {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
  userId: string;
  exp: number;
  code: string;
}

/**
 * Create a JWT-based Echo Access Token for fast validation
 */
async function createEchoAccessJwtToken(params: {
  userId: string;
  appId: string;
  scope: string;
  expiry: Date;
  keyVersion?: number;
  sessionId?: string;
}): Promise<string> {
  const { userId, appId, scope, expiry, keyVersion = 1, sessionId } = params;

  const tokenId = nanoid(16);
  const now = Math.floor(Date.now() / 1000); // divide by 1000 to convert to seconds
  const expirySeconds = Math.floor(expiry.getTime() / 1000); // divide by 1000 to convert to seconds

  const token = await new SignJWT({
    user_id: userId,
    app_id: appId,
    scope,
    key_version: keyVersion,
    ...(sessionId ? { sid: sessionId } : {}),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setAudience(appId)
    .setJti(tokenId)
    .setIssuedAt(now)
    // set expiration time to the expiry time of the access token
    .setExpirationTime(expirySeconds)
    .sign(API_ECHO_ACCESS_JWT_SECRET);

  return token;
}

/**
 * Verify and decode JWT API token (fast path - no DB lookup)
 *
 * This should not include a Bearer prefix
 */
async function verifyEchoAccessJwtToken(
  token: string
): Promise<ApiTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, API_ECHO_ACCESS_JWT_SECRET, {
      clockTolerance: 5, // 5 seconds clock skew tolerance
    });

    // Type assertion with validation
    const apiPayload = payload as unknown as ApiTokenPayload;

    // Validate required fields
    if (!apiPayload.user_id || !apiPayload.app_id || !apiPayload.scope) {
      return null;
    }

    return apiPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function authenticateEchoAccessJwtToken(
  jwtToken: string
): Promise<{
  userId: string;
  appId: string;
  scope: string;
}> {
  const jwtPayload = await verifyEchoAccessJwtToken(jwtToken);

  if (!jwtPayload) {
    throw new Error('Invalid or expired JWT token');
  }

  if (jwtPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('JWT token has expired');
  }

  return {
    userId: jwtPayload.user_id,
    appId: jwtPayload.app_id,
    scope: jwtPayload.scope,
  };
}

/**
 * Refresh token response type
 */
interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  echo_app: {
    id: string;
    name: string;
    description: string;
  };
}

/**
 * Refresh token error type
 */
interface RefreshTokenError {
  error: string;
  error_description: string;
}

/**
 * Handle refresh token logic
 */
export async function handleRefreshToken(
  refreshToken: string,
  metadata?: { deviceName?: string; userAgent?: string; ipAddress?: string }
): Promise<RefreshTokenResponse | RefreshTokenError> {
  logger.emit({
    severityText: 'INFO',
    body: 'Processing refresh token request',
    attributes: {
      function: 'handleRefreshToken',
    },
  });

  /* 1️⃣ Find and validate refresh token */
  const echoRefreshTokenRecord = await db.refreshToken.findUnique({
    where: {
      token: refreshToken,
    },
    include: {
      user: true,
      echoApp: true,
      session: true,
    },
  });

  // Grace period for archived tokens
  const archivedGraceMs = getArchivedRefreshTokenGraceMs();
  if (
    !echoRefreshTokenRecord ||
    (echoRefreshTokenRecord.archivedAt &&
      echoRefreshTokenRecord.archivedAt <
        new Date(Date.now() - archivedGraceMs))
  ) {
    logger.emit({
      severityText: 'WARN',
      body: 'Refresh token not found or archived beyond grace period',
      attributes: {
        function: 'handleRefreshToken',
      },
    });
    return {
      error: 'invalid_grant',
      error_description: 'Invalid or expired refresh token',
    };
  }

  if (echoRefreshTokenRecord.archivedAt) {
    console.warn('🔄 Allowed a refresh for archived token within grace period');
  }

  /* 2️⃣ Check if refresh token is expired */
  if (echoRefreshTokenRecord.expiresAt < new Date()) {
    // Deactivate expired token
    await db.refreshToken.update({
      where: { id: echoRefreshTokenRecord.id },
      data: { isArchived: true },
    });

    return {
      error: 'invalid_grant',
      error_description: 'Refresh token has expired',
    };
  }

  /* 3️⃣ Check if session and echo app are still active */
  if (
    !echoRefreshTokenRecord.session ||
    echoRefreshTokenRecord.session.revokedAt
  ) {
    return {
      error: 'invalid_grant',
      error_description: 'Session is revoked or invalid',
    };
  }

  const sessionId = echoRefreshTokenRecord.session.id;

  if (echoRefreshTokenRecord.echoApp.isArchived) {
    return {
      error: 'invalid_grant',
      error_description: 'Echo app is no longer active',
    };
  }

  /* 4️⃣ Generate new refresh token (rotate within the same session) */
  const newEchoRefreshTokenValue = `refresh_${nanoid(48)}`;
  const newEchoRefreshTokenExpiry = createEchoRefreshTokenExpiry();

  // Deactivate old refresh token
  await db.refreshToken.update({
    where: { id: echoRefreshTokenRecord.id },
    data: { isArchived: true },
  });

  // Create new refresh token
  const newEchoRefreshToken = await db.refreshToken.create({
    data: {
      token: newEchoRefreshTokenValue,
      expiresAt: newEchoRefreshTokenExpiry,
      userId: echoRefreshTokenRecord.userId,
      echoAppId: echoRefreshTokenRecord.echoAppId,
      scope: echoRefreshTokenRecord.scope,
      sessionId,
    },
  });

  // Update session last seen
  await db.appSession.update({
    where: { id: sessionId },
    data: {
      lastSeenAt: new Date(),
      ...(metadata?.userAgent ? { userAgent: metadata.userAgent } : {}),
      ...(metadata?.ipAddress ? { ipAddress: metadata.ipAddress } : {}),
      ...(metadata?.deviceName ? { deviceName: metadata.deviceName } : {}),
    },
  });

  const newEchoAccessTokenExpiry = createEchoAccessTokenExpiry();

  /* 5️⃣ Generate new JWT access token */
  const echoAccessTokenJwtToken = await createEchoAccessJwtToken({
    userId: newEchoRefreshToken.userId,
    appId: newEchoRefreshToken.echoAppId,
    scope: echoRefreshTokenRecord.scope,
    keyVersion: 1,
    expiry: newEchoAccessTokenExpiry,
    sessionId,
  });

  /* 6️⃣ Return new tokens with user and app info */
  return {
    access_token: echoAccessTokenJwtToken,
    token_type: 'Bearer',
    expires_in: Math.floor(
      (newEchoAccessTokenExpiry.getTime() - Date.now()) / 1000
    ),
    refresh_token: newEchoRefreshToken.token,
    refresh_token_expires_in: Math.floor(
      (newEchoRefreshTokenExpiry.getTime() - Date.now()) / 1000
    ),
    scope: echoRefreshTokenRecord.scope,
    user: {
      id: echoRefreshTokenRecord.user.id,
      email: echoRefreshTokenRecord.user.email,
      name: echoRefreshTokenRecord.user.name || '',
    },
    echo_app: {
      id: echoRefreshTokenRecord.echoApp.id,
      name: echoRefreshTokenRecord.echoApp.name,
      description: echoRefreshTokenRecord.echoApp.description || '',
    },
  };
}

/**
 * Authorization code token request parameters
 */
interface AuthCodeTokenRequest {
  code: string;
  redirect_uri: string;
  client_id: string;
  code_verifier: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Initial token issuance response type (same as refresh response)
 */
type InitialTokenResponse = RefreshTokenResponse;

/**
 * Initial token issuance error type (same as refresh error)
 */
type InitialTokenError = RefreshTokenError;

/**
 * Handle initial token issuance from authorization code
 */
export async function handleInitialTokenIssuance(
  params: AuthCodeTokenRequest
): Promise<InitialTokenResponse | InitialTokenError> {
  const {
    code,
    redirect_uri,
    client_id,
    code_verifier,
    deviceName,
    userAgent,
    ipAddress,
  } = params;

  logger.emit({
    severityText: 'INFO',
    body: 'Processing authorization code token request',
    attributes: {
      function: 'handleInitialTokenIssuance',
      client_id,
    },
  });

  /* 1️⃣ Validate code verifier length (RFC 7636 Section 4.1) */
  if (code_verifier.length < 43 || code_verifier.length > 128) {
    return {
      error: 'invalid_request',
      error_description: 'code_verifier must be 43-128 characters long',
    };
  }

  /* 2️⃣ Validate code verifier format (only unreserved characters) */
  if (!/^[A-Za-z0-9._~-]+$/.test(code_verifier)) {
    return {
      error: 'invalid_request',
      error_description: 'code_verifier contains invalid characters',
    };
  }

  /* 3️⃣ Verify and decode the authorization code JWT */
  let authData: AuthCodePayload;
  try {
    const { payload } = await jwtVerify(code, JWT_SECRET);
    authData = payload as unknown as AuthCodePayload;
  } catch {
    return {
      error: 'invalid_grant',
      error_description: 'Invalid or expired authorization code',
    };
  }

  /* 4️⃣ Validate the authorization code data */
  if (
    authData.clientId !== client_id ||
    authData.redirectUri !== redirect_uri
  ) {
    return {
      error: 'invalid_grant',
      error_description: 'Authorization code does not match request parameters',
    };
  }

  /* 5️⃣ Verify PKCE code challenge */
  const codeVerifierHash = createHash('sha256')
    .update(code_verifier)
    .digest('base64url');

  if (codeVerifierHash !== authData.codeChallenge) {
    return {
      error: 'invalid_grant',
      error_description: 'PKCE verification failed',
    };
  }

  /* 6️⃣ Get user and validate they exist */
  const user = await db.user.findUnique({
    where: { id: authData.userId },
  });

  if (!user) {
    return {
      error: 'invalid_grant',
      error_description: 'User not found',
    };
  }

  /* 7️⃣ Find and validate the Echo app (client) */
  const echoApp = await db.echoApp.findFirst({
    where: {
      id: client_id,
    },
  });

  if (!echoApp) {
    return {
      error: 'invalid_client',
      error_description: 'Invalid or inactive client_id',
    };
  }

  /* 8️⃣ Validate redirect_uri against authorized callback URLs */
  const isLocalhostUrl = redirect_uri.startsWith('http://localhost:');
  const redirectUriWithoutTrailingSlash = redirect_uri.replace(/\/$/, '');
  const isAuthorizedUrl =
    echoApp.authorizedCallbackUrls.includes(redirect_uri) ||
    echoApp.authorizedCallbackUrls.includes(redirectUriWithoutTrailingSlash);

  if (!isLocalhostUrl && !isAuthorizedUrl) {
    return {
      error: 'invalid_grant',
      error_description:
        'redirect_uri (' +
        redirectUriWithoutTrailingSlash +
        ') is not authorized for this app',
    };
  }

  /* 9️⃣ Ensure the user has access to this Echo app */
  let userRole = await PermissionService.getUserAppRole(user.id, echoApp.id);

  if (userRole === AppRole.PUBLIC) {
    try {
      logger.emit({
        severityText: 'INFO',
        body: 'Creating app membership for user',
        attributes: {
          userId: user.id,
          echoAppId: echoApp.id,
          function: 'handleInitialTokenIssuance',
        },
      });
      // User needs to join the app
      const appMembership = await db.appMembership.create({
        data: {
          userId: user.id,
          echoAppId: echoApp.id,
          status: MembershipStatus.ACTIVE,
          role: AppRole.CUSTOMER,
          totalSpent: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      userRole = appMembership.role as AppRole;
    } catch (error) {
      console.error('Error creating app membership:', error);
      return {
        error: 'server_error',
        error_description: 'Error creating app membership',
      };
    }
  }

  if (
    !userRole ||
    ![AppRole.OWNER, AppRole.ADMIN, AppRole.CUSTOMER].includes(userRole)
  ) {
    return {
      error: 'invalid_grant',
      error_description: 'Client does not belong to the authenticated user',
    };
  }

  /* 🔟 Create an app session and refresh token */
  const appSession = await db.appSession.create({
    data: {
      userId: user.id,
      echoAppId: echoApp.id,
      deviceName,
      userAgent,
      ipAddress,
    },
  });

  const echoRefreshTokenValue = `refresh_${nanoid(48)}`;
  const echoRefreshTokenExpiry = createEchoRefreshTokenExpiry();

  const newEchoRefreshToken = await db.refreshToken.create({
    data: {
      token: echoRefreshTokenValue,
      expiresAt: echoRefreshTokenExpiry,
      userId: user.id,
      echoAppId: echoApp.id,
      scope: authData.scope,
      sessionId: appSession.id,
    },
  });

  const newEchoAccessTokenExpiry = createEchoAccessTokenExpiry();

  /* 1️⃣1️⃣ Generate JWT access token for fast validation */
  const echoAccessTokenJwtToken = await createEchoAccessJwtToken({
    userId: user.id,
    appId: echoApp.id,
    scope: authData.scope,
    keyVersion: 1,
    expiry: newEchoAccessTokenExpiry,
    sessionId: appSession.id,
  });

  logger.emit({
    severityText: 'INFO',
    body: 'JWT access token generated',
    attributes: {
      userId: user.id,
      echoAppId: echoApp.id,
      function: 'handleInitialTokenIssuance',
    },
  });

  /* 1️⃣2️⃣ Return the JWT access token response with refresh token */
  return {
    access_token: echoAccessTokenJwtToken,
    token_type: 'Bearer',
    expires_in: Math.floor(
      (newEchoAccessTokenExpiry.getTime() - Date.now()) / 1000
    ),
    refresh_token: newEchoRefreshToken.token,
    refresh_token_expires_in: Math.floor(
      (newEchoRefreshToken.expiresAt.getTime() - Date.now()) / 1000
    ),
    scope: authData.scope,
    user: {
      id: user.id,
      email: user.email,
      name: user.name || '',
    },
    echo_app: {
      id: echoApp.id,
      name: echoApp.name,
      description: echoApp.description || '',
    },
  };
}
