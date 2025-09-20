import z from 'zod';

import { createHash } from 'crypto';
import { jwtVerify } from 'jose';

import { authCodeJwtPayloadSchema } from '@/app/(auth)/(oauth)/(authorize)/_lib/code';
import { isValidRedirectUri } from '@/app/(auth)/(oauth)/_lib/redirect-uri';

import { db } from '@/lib/db';
import { PermissionService } from '@/lib/permissions/service';
import { AppRole, MembershipStatus } from '@/lib/permissions/types';

import { createEchoAccessJwt } from '@/lib/access-token';
import { createRefreshToken } from './refresh';
import { tokenResponse } from './response';

import { logger } from '@/logger';
import { env } from '@/env';

import type { TokenMetadata } from './types';
import {
  OAuthError,
  OAuthErrorType,
} from '@/app/(auth)/(oauth)/_lib/oauth-error';
import { oauthValidationError } from '@/app/(auth)/(oauth)/_lib/oauth-route';

export const handleIssueTokenSchema = z.object({
  redirect_uri: z.url({
    error: oauthValidationError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'redirect_uri must be a valid URL',
    }),
  }),
  client_id: z.uuid({
    error: oauthValidationError({
      error: OAuthErrorType.INVALID_CLIENT,
      error_description: 'client_id must be a valid UUID',
    }),
  }),
  code: z.string({
    error: oauthValidationError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'code must be a string',
    }),
  }),
  code_verifier: z
    .string({
      error: oauthValidationError({
        error: OAuthErrorType.INVALID_REQUEST,
        error_description: 'code_verifier must be a string',
      }),
    })
    .min(43, {
      error: oauthValidationError({
        error: OAuthErrorType.INVALID_REQUEST,
        error_description: 'code_verifier must be at least 43 characters',
      }),
    })
    .max(128, {
      error: oauthValidationError({
        error: OAuthErrorType.INVALID_REQUEST,
        error_description: 'code_verifier must be at most 128 characters',
      }),
    })
    .regex(/^[A-Za-z0-9._~-]+$/, {
      error: oauthValidationError({
        error: OAuthErrorType.INVALID_REQUEST,
        error_description: 'code_verifier contains invalid characters',
      }),
    }),
});

export async function handleIssueToken(
  params: z.infer<typeof handleIssueTokenSchema>,
  metadata?: TokenMetadata
) {
  const { code, redirect_uri, client_id, code_verifier } = params;

  logger.emit({
    severityText: 'INFO',
    body: 'Processing authorization code token request',
    attributes: {
      function: 'handleInitialTokenIssuance',
      client_id,
    },
  });

  const { payload } = await jwtVerify(
    code,
    new TextEncoder().encode(env.OAUTH_CODE_SIGNING_JWT_SECRET)
  ).catch(() => {
    throw new OAuthError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'Invalid authorization code',
    });
  });
  const {
    client_id: codeClientId,
    redirect_uri: codeRedirectUri,
    code_challenge,
    user_id,
    scope,
  } = authCodeJwtPayloadSchema.parse(payload);

  /* 4️⃣ Validate the authorization code data */
  if (codeClientId !== client_id || codeRedirectUri !== redirect_uri) {
    throw new OAuthError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'Authorization code does not match request parameters',
    });
  }

  /* 5️⃣ Verify PKCE code challenge */
  const codeVerifierHash = createHash('sha256')
    .update(code_verifier)
    .digest('base64url');

  if (codeVerifierHash !== code_challenge) {
    throw new OAuthError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'PKCE verification failed',
    });
  }

  const user = await db.user.findUnique({
    where: { id: user_id, isArchived: false },
  });

  if (!user) {
    throw new OAuthError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'User not found',
    });
  }

  /* 7️⃣ Find and validate the Echo app (client) */
  const app = await db.echoApp.findUnique({
    where: {
      id: client_id,
      isArchived: false,
    },
  });

  if (!app) {
    throw new OAuthError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'App not found',
    });
  }

  /* 8️⃣ Validate redirect_uri against authorized callback URLs */
  if (!isValidRedirectUri(redirect_uri, app.authorizedCallbackUrls)) {
    throw new OAuthError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: `Redirect URI is not authorized for this app: ${redirect_uri}`,
    });
  }

  /* 9️⃣ Ensure the user has access to this Echo app */
  let userRole = await PermissionService.getUserAppRole(user.id, app.id);

  if (userRole === AppRole.PUBLIC) {
    try {
      logger.emit({
        severityText: 'INFO',
        body: 'Creating app membership for user',
        attributes: {
          userId: user.id,
          echoAppId: app.id,
          function: 'handleInitialTokenIssuance',
        },
      });
      // User needs to join the app
      await db.appMembership.create({
        data: {
          userId: user.id,
          echoAppId: app.id,
          status: MembershipStatus.ACTIVE,
          role: AppRole.CUSTOMER,
          totalSpent: 0,
        },
      });
      userRole = AppRole.CUSTOMER;
    } catch {
      throw new OAuthError({
        error: OAuthErrorType.SERVER_ERROR,
        error_description: 'Error creating app membership',
      });
    }
  }

  const [session, refreshToken] = await db.$transaction(async tx => {
    const appSession = await tx.appSession.create({
      data: {
        userId: user.id,
        echoAppId: app.id,
        deviceName: metadata?.deviceName,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
      },
    });

    const newEchoRefreshToken = await createRefreshToken(
      {
        userId: user.id,
        echoAppId: app.id,
        scope,
        sessionId: appSession.id,
      },
      tx
    );

    return [appSession, newEchoRefreshToken];
  });

  const accessToken = await createEchoAccessJwt({
    user_id: user.id,
    app_id: app.id,
    session_id: session.id,
    scope,
  });

  logger.emit({
    severityText: 'INFO',
    body: 'JWT access token generated',
    attributes: {
      userId: user.id,
      echoAppId: app.id,
      function: 'handleInitialTokenIssuance',
    },
  });

  return tokenResponse({
    user,
    app,
    accessToken,
    refreshToken,
  });
}
