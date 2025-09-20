import { z } from 'zod';

import { ApiKey, Prisma } from '@/generated/prisma';

import { db } from '../lib/db';
import { AppRole, MembershipStatus } from '../lib/permissions/types';
import { PermissionService } from '../lib/permissions';
import { PaginationParams, toPaginatedReponse } from './lib/pagination';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { env } from '@/env';

export const getApiKeySchema = z.string();

export const getApiKey = async (
  userId: string,
  id: z.infer<typeof getApiKeySchema>
): Promise<ApiKey | null> => {
  return db.apiKey.findFirst({
    where: {
      id,
      userId,
      isArchived: false,
    },
  });
};

export const listApiKeysSchema = z.object({
  appId: z.string().optional(),
});

export const listApiKeys = async (
  userId: string,
  { appId }: z.infer<typeof listApiKeysSchema>,
  { page, page_size }: PaginationParams
) => {
  const skip = page * page_size;

  const where: Prisma.ApiKeyWhereInput = {
    userId,
    isArchived: false,
    echoApp: {
      ...(appId ? { id: appId } : {}),
      appMemberships: {
        some: {
          userId,
          status: MembershipStatus.ACTIVE,
        },
      },
    },
  };

  const [totalCount, apiKeys] = await Promise.all([
    countApiKeysInternal(where),
    db.apiKey.findMany({
      where,
      skip,
      take: page_size,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        lastUsed: true,
        isArchived: true,
        echoApp: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
    }),
  ]);

  return toPaginatedReponse({
    items: apiKeys,
    total_count: totalCount,
    page,
    page_size,
  });
};

export const findApiKeyByHash = async (apiKey: string) => {
  const keyHash = hashApiKey(apiKey);
  return db.apiKey.findUnique({
    where: {
      keyHash,
      isArchived: false,
      user: { isArchived: false },
      echoApp: { isArchived: false },
    },
    include: {
      user: true,
      echoApp: true,
    },
  });
};

export const countApiKeys = async (
  userId: string,
  { appId }: z.infer<typeof listApiKeysSchema>
) => {
  return countApiKeysInternal({
    userId,
    isArchived: false,
    echoApp: { id: appId },
  });
};

const countApiKeysInternal = async (where: Prisma.ApiKeyWhereInput) => {
  return db.apiKey.count({
    where,
  });
};

export const createApiKeySchema = z.object({
  echoAppId: z.string(),
  name: z.string().optional(),
});

export async function createApiKey(
  userId: string,
  { echoAppId, name }: z.infer<typeof createApiKeySchema>
) {
  const userRole = await PermissionService.getUserAppRole(userId, echoAppId);

  const scope = [AppRole.OWNER, AppRole.ADMIN].includes(userRole)
    ? 'owner'
    : 'customer';

  const uuidPart = randomUUID().replace(/-/g, '');
  const entropyPart = randomBytes(16).toString('hex');
  const generatedKey = `${env.API_KEY_PREFIX}${uuidPart}${entropyPart}`;

  // Hash the API key for secure storage (deterministic for O(1) lookup)
  const keyHash = hashApiKey(generatedKey);

  // Create the API key
  const apiKey = await db.apiKey.create({
    data: {
      keyHash,
      name: name || 'API Key',
      userId,
      echoAppId,
      scope,
    },
    include: {
      echoApp: true,
    },
  });

  return {
    ...apiKey,
    key: generatedKey, // Include the plaintext key in the response for the user to copy
  };
}

export const updateApiKeySchema = z.object({
  id: z.string(),
  data: z.object({
    name: z.string(),
  }),
});

export async function updateApiKey(
  userId: string,
  { id, data }: z.infer<typeof updateApiKeySchema>
): Promise<ApiKey> {
  return db.apiKey.update({
    where: { id, userId },
    data,
  });
}

export const deleteApiKeySchema = z.string();

export async function deleteApiKey(
  userId: string,
  id: z.infer<typeof deleteApiKeySchema>
) {
  const now = new Date();
  return await db.apiKey.update({
    where: { id, userId },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });
}

const hashApiKey = (apiKey: string) => {
  if (apiKey.length === 0) {
    throw new Error('API key must be a non-empty string');
  }

  return createHmac('sha256', env.API_KEY_HASH_SECRET)
    .update(apiKey)
    .digest('hex');
};
