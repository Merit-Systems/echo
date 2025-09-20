import z from 'zod';

import { nanoid } from 'nanoid';

import { addSeconds, subMilliseconds } from 'date-fns';

import { tokenResponse } from './response';

import { db } from '@/lib/db';

import { logger } from '@/logger';
import { env } from '@/env';

import { createEchoAccessJwt } from '@/lib/access-token';

import type { Prisma } from '@/generated/prisma';
import type { TokenMetadata } from './types';
import { oauthValidationError } from '@/app/(auth)/(oauth)/_lib/oauth-route';
import {
  OAuthError,
  OAuthErrorType,
} from '@/app/(auth)/(oauth)/_lib/oauth-error';

export const handleRefreshTokenSchema = z.object({
  refresh_token: z.string({
    error: oauthValidationError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'refresh_token must be a string',
    }),
  }),
});

export async function handleRefreshToken(
  { refresh_token: token }: z.output<typeof handleRefreshTokenSchema>,
  metadata?: TokenMetadata
) {
  logger.emit({
    severityText: 'INFO',
    body: 'Processing refresh token request',
    attributes: {
      function: 'handleRefreshToken',
    },
  });

  const refreshToken = await db.refreshToken.findUnique({
    where: {
      token,
      OR: [
        { isArchived: false, archivedAt: null },
        {
          isArchived: true,
          archivedAt: {
            lt: subMilliseconds(
              new Date(),
              env.OAUTH_REFRESH_TOKEN_ARCHIVE_GRACE_MS
            ),
          },
          expiresAt: { lt: new Date() },
        },
      ],
      session: { isArchived: false, revokedAt: null },
      echoApp: { isArchived: false },
      user: { isArchived: false },
    },
    include: {
      user: true,
      echoApp: true,
      session: true,
    },
  });

  if (!refreshToken) {
    throw new OAuthError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'Refresh token not found',
    });
  }

  if (refreshToken.expiresAt < new Date()) {
    // Deactivate expired token
    archiveRefreshToken(token);
    throw new OAuthError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'Refresh token expired',
    });
  }

  if (refreshToken.archivedAt) {
    console.warn('🔄 Allowed a refresh for archived token within grace period');
  }

  const { user, echoApp: app, session, scope } = refreshToken;

  if (!session) {
    throw new OAuthError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description: 'Session not found',
    });
  }

  const sessionId = session.id;

  // Deactivate old refresh token
  await archiveRefreshToken(token);

  const newRefreshToken = await db.$transaction(async tx => {
    const [newRefreshToken] = await Promise.all([
      await createRefreshToken(
        {
          userId: user.id,
          echoAppId: app.id,
          scope,
          sessionId,
        },
        tx
      ),
      await db.appSession.update({
        where: { id: sessionId },
        data: {
          lastSeenAt: new Date(),
          ...(metadata?.userAgent ? { userAgent: metadata.userAgent } : {}),
          ...(metadata?.ipAddress ? { ipAddress: metadata.ipAddress } : {}),
          ...(metadata?.deviceName ? { deviceName: metadata.deviceName } : {}),
        },
      }),
    ]);

    return newRefreshToken;
  });

  const accessToken = await createEchoAccessJwt({
    user_id: user.id,
    app_id: app.id,
    session_id: sessionId,
    scope,
  });

  return tokenResponse({
    user,
    app,
    accessToken,
    refreshToken: newRefreshToken,
  });
}

const archiveRefreshToken = async (refreshToken: string) => {
  await db.refreshToken.update({
    where: { token: refreshToken },
    data: { isArchived: true, archivedAt: new Date() },
  });
};

const createRefreshTokenParamsSchema = z.object({
  userId: z.uuid(),
  echoAppId: z.uuid(),
  scope: z.string().default(''),
  sessionId: z.uuid(),
});

export const createRefreshToken = async (
  params: z.input<typeof createRefreshTokenParamsSchema>,
  tx?: Prisma.TransactionClient
) => {
  const client = tx ?? db;
  const tokenData = createRefreshTokenParamsSchema.parse(params);
  return client.refreshToken.create({
    data: {
      token: `refresh_${nanoid(48)}`,
      expiresAt: createEchoRefreshTokenExpiry(),
      ...tokenData,
    },
  });
};

const createEchoRefreshTokenExpiry = () => {
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
};
