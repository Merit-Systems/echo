import { db } from '../../lib/db';
import type { PrismaClient } from '@/generated/prisma';

export const getUserGlobalBalance = async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const totalPaid = Number(user.totalPaid);
  const totalSpent = Number(user.totalSpent);

  return {
    totalPaid,
    totalSpent,
    balance: totalPaid - totalSpent,
    currency: 'USD',
  };
};

export const getUserAppBalance = async (userId: string, echoAppId: string) => {
  const appMembership = await db.appMembership.findUnique({
    where: {
      userId_echoAppId: {
        userId,
        echoAppId,
      },
    },
    include: {
      user: true,
      echoApp: true,
    },
  });

  if (!appMembership) {
    throw new Error('App membership not found');
  }

  const totalPaid = Number(appMembership.user.totalPaid);
  const totalSpent = Number(appMembership.user.totalSpent);
  const totalSpentOnApp = Number(appMembership.totalSpent);

  return {
    balance: totalPaid - totalSpent,
    totalPaid,
    totalSpent: totalSpentOnApp,
    currency: 'USD',
    echoAppId,
    echoAppName: appMembership.echoApp.name,
  };
};

/**
 * Update user balance from a payment within an existing transaction
 * @param tx - The database transaction
 * @param userId - The user ID to update
 * @param amountInCents - The payment amount in cents
 */
export async function updateUserBalanceFromPayment(
  tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0],
  userId: string,
  amountInCents: number
): Promise<void> {
  // Convert from cents to dollars and update user's totalPaid balance
  await tx.user.update({
    where: { id: userId },
    data: {
      totalPaid: {
        increment: amountInCents / 100,
      },
    },
  });
}
