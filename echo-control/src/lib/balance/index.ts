import { db } from '../db';
import type { PrismaClient } from '@/generated/prisma';
import type { Balance, AppBalance } from './types';

export const getUserGlobalBalance = async (
  userId: string
): Promise<Balance> => {
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

export const getUserAppBalance = async (
  userId: string,
  echoAppId: string
): Promise<AppBalance> => {
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

// Helper function to safely format currency
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }

  const numValue = Number(value);

  // Show <$0.01 for values greater than 0 but less than 0.01
  if (numValue > 0 && numValue < 0.01) {
    return '<$0.01';
  }

  return `$${numValue.toFixed(2)}`;
};
