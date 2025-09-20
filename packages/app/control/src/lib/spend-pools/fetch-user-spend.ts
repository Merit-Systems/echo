import { Prisma } from '@/generated/prisma';
import { db } from '../db';

export const getCustomerSpendInfoForApp = async (
  userId: string,
  appId: string,
  tx?: Prisma.TransactionClient
) => {
  const client = tx ?? db;

  const spendPool = await client.spendPool.findFirst({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    include: {
      userUsage: {
        where: {
          userId,
          isArchived: false,
        },
      },
    },
  });

  if (!spendPool) {
    return {
      spendPoolBalance: 0,
      userSpendInfo: {
        userId,
        echoAppId: appId,
        spendPoolId: null as string | null,
        amountSpent: 0,
        spendLimit: null,
        amountLeft: 0,
      },
    };
  }

  const spendLimit = spendPool.perUserSpendLimit
    ? Number(spendPool.perUserSpendLimit)
    : null;

  const spendPoolBalance =
    Number(spendPool.totalPaid) - Number(spendPool.totalSpent);

  const userSpendInfoRow = spendPool.userUsage.find(
    userUsage => userUsage.userId === userId
  );

  // if there is a per user spend limit, and balance > limit, set balance to limit
  const userSpendPoolBalance =
    spendLimit && spendPoolBalance > spendLimit ? spendLimit : spendPoolBalance;

  if (!userSpendInfoRow) {
    return {
      spendPoolBalance: spendPoolBalance,
      userSpendInfo: {
        userId,
        echoAppId: appId,
        spendPoolId: spendPool.id as string | null,
        amountSpent: 0,
        spendLimit: spendLimit,
        amountLeft: userSpendPoolBalance,
      },
    };
  }

  const userSpendInfo = {
    userId,
    echoAppId: appId,
    spendPoolId: spendPool.id as string | null,
    amountSpent: Number(userSpendInfoRow.totalSpent) || 0,
    spendLimit,
    amountLeft: spendLimit
      ? spendLimit - Number(userSpendInfoRow.totalSpent)
      : spendPoolBalance,
  };

  return {
    spendPoolBalance,
    userSpendInfo,
  };
};
