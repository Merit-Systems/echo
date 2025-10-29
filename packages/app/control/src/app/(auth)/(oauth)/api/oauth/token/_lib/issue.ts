import z from 'zod';

import { createHash } from 'crypto';
import { jwtVerify } from 'jose';

import { authCodeJwtPayloadSchema } from '@/app/(auth)/(oauth)/(authorize)/_lib/code';
import { isValidRedirectUri } from '@/app/(auth)/(oauth)/_lib/redirect-uri';

import { PermissionService } from '@/services/db/apps/permissions/service';
import { AppRole } from '@/services/db/apps/permissions/types';

import { createEchoAccessJwt } from '@/lib/access-token';
import { tokenResponse } from './response';

import { logger } from '@/logger';
import { env } from '@/env';

import {
  OAuthError,
  OAuthErrorType,
} from '@/app/(auth)/(oauth)/_lib/oauth-error';
import { oauthValidationError } from '@/app/(auth)/(oauth)/_lib/oauth-route';
import { getUser } from '@/services/db/admin/user/user';
import { getApp } from '@/services/db/apps/get';
import { createAppMembership } from '@/services/db/apps/membership';

import { issueOAuthToken } from '@/services/db/auth/oauth-token';
import { createApiKey } from '@/services/db/api-keys';

import type { TokenMetadata } from '@/types/token-metadata';

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

  const user = await getUser(user_id);

  if (!user) {
    throw new OAuthError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'User not found',
    });
  }

  /* 7️⃣ Find and validate the Echo app (client) */
  const app = await getApp(client_id);

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
      await createAppMembership(user.id, app.id, {});
      userRole = AppRole.CUSTOMER;
    } catch {
      throw new OAuthError({
        error: OAuthErrorType.SERVER_ERROR,
        error_description: 'Error creating app membership',
      });
    }
  }

  /* 🔟 Check if api_key:create scope is present */
  const scopes = scope.split(' ');
  const shouldCreateApiKey = scopes.includes('api_key:create');

  const { session, refreshToken } = await issueOAuthToken({
    userId: user.id,
    appId: app.id,
    scope,
    metadata,
  });

  if (shouldCreateApiKey) {
    logger.emit({
      severityText: 'INFO',
      body: 'Creating API key for user with api_key:create scope',
      attributes: {
        userId: user.id,
        echoAppId: app.id,
        function: 'handleInitialTokenIssuance',
      },
    });

    /* Generate an API key instead of a temporary JWT token */
    const apiKey = await createApiKey(user.id, {
      echoAppId: app.id,
      name: 'OAuth Generated API Key',
    });

    logger.emit({
      severityText: 'INFO',
      body: 'API key generated for OAuth flow',
      attributes: {
        userId: user.id,
        echoAppId: app.id,
        apiKeyId: apiKey.id,
        function: 'handleInitialTokenIssuance',
      },
    });

    /* Return API key as access token with a very long expiration (100 years) */
    return tokenResponse({
      accessToken: {
        access_token: apiKey.key,
        scope,
        access_token_expiry: new Date(
          Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
        ), // 100 years
      },
      refreshToken,
    });
  }

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
    accessToken,
    refreshToken,
  });
}
