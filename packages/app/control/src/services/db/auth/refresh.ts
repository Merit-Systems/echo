import z from 'zod';

import { nanoid } from 'nanoid';

import { addSeconds, subMilliseconds } from 'date-fns';

import { db } from '../client';

import { env } from '@/env';

import type { Prisma } from '@/generated/prisma';

export const findRefreshToken = async (token: string) => {
  return await db.refreshToken.findUnique({
    where: {
      token,
      OR: [
        { isArchived: false, archivedAt: null },
        {
          isArchived: true,
          archivedAt: {
            gt: subMilliseconds(
              new Date(),
              env.OAUTH_REFRESH_TOKEN_ARCHIVE_GRACE_MS
            ),
          },
          expiresAt: { gt: new Date() },
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
      expiresAt: addSeconds(new Date(), env.OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS),
      ...tokenData,
    },
    include: {
      user: true,
      echoApp: true,
    },
  });
};

export const archiveRefreshToken = async (
  refreshToken: string,
  tx?: Prisma.TransactionClient
) => {
  const client = tx ?? db;
  await client.refreshToken.update({
    where: { token: refreshToken },
    data: { isArchived: true, archivedAt: new Date() },
  });
};
