import { db } from '@/lib/db';
import type { AppId } from './lib/schemas';
import { AppRole } from '@/lib/permissions';
import z from 'zod';

export const getFreeTierSpendPool = async (appId: AppId, userId: string) => {
  const spendPool = await db.spendPool.findFirst({
    where: {
      echoAppId: appId,
      isArchived: false,
      echoApp: {
        appMemberships: {
          some: {
            userId,
            role: AppRole.OWNER,
          },
        },
      },
    },
  });

  if (!spendPool) {
    return null;
  }

  return {
    ...spendPool,
    archivedAt: spendPool.archivedAt?.toISOString(),
    createdAt: spendPool.createdAt.toISOString(),
    updatedAt: spendPool.updatedAt.toISOString(),
    totalPaid: Number(spendPool.totalPaid),
    totalSpent: Number(spendPool.totalSpent),
    balance: Number(spendPool.totalPaid.minus(spendPool.totalSpent)),
    perUserSpendLimit: spendPool.perUserSpendLimit?.toNumber(),
  };
};

export const updateFreeTierSpendPoolSchema = z.object({
  perUserSpendLimit: z.number().positive(),
});

export const updateFreeTierSpendPool = async (
  appId: string,
  userId: string,
  input: z.infer<typeof updateFreeTierSpendPoolSchema>
) => {
  const parsedInput = updateFreeTierSpendPoolSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error('Invalid input');
  }

  // FROM JSON:
  // this is a bit of a hack because we are currently only allowing one spend pool per app
  // IMO the abstraction of updating by app ID is better than specifying the spend poolID in the input
  await db.spendPool.updateMany({
    where: {
      echoAppId: appId,
      echoApp: {
        appMemberships: {
          some: {
            userId,
            role: AppRole.OWNER,
          },
        },
      },
    },
    data: parsedInput.data,
  });
};
