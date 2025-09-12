import z from 'zod';

import { mintCreditsToUser, mintCreditsToUserSchema } from '../credits';

import { db } from '@/lib/db';

import { ReferralCodeType } from '@/lib/referral-codes/types';

import type { EchoApp, User } from '@/generated/prisma';

import {
  getUserEarningsAggregates,
  getAppTransactionAggregates,
  getAllUsersEarningsAggregates,
  getAllUsersEarningsAggregatesPaginated,
  getAppEarningsAcrossAllUsers,
} from './user-earnings';

import {
  getUserSpendingAggregates,
  getAppSpendingAggregates,
  getAllUsersSpendingAggregates,
  getAllUsersSpendingAggregatesPaginated,
  getAppSpendingAcrossAllUsers,
} from './user-spending';

import {
  getAppTransactionsPaginated,
  getAppTransactionTotals,
} from './app-transactions';

import {
  getUserTransactionsPaginated,
  getUserTransactionTotals,
} from './user-transactions';

export const isAdmin = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  return user?.admin;
};

export async function adminGetUsers(): Promise<User[]> {
  return await db.user.findMany();
}

export async function adminGetAppsForUser(userId: string): Promise<EchoApp[]> {
  return await db.echoApp.findMany({
    where: {
      appMemberships: {
        some: {
          userId: userId,
          role: 'owner',
        },
      },
    },
  });
}

export async function adminMintCreditsToUser(
  input: z.infer<typeof mintCreditsToUserSchema>
) {
  return await mintCreditsToUser(input);
}

export const adminMintCreditReferralCodeSchema = z.object({
  amountInDollars: z.number().positive('Amount must be positive'),
  expiresAt: z
    .date()
    .optional()
    .default(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
});

export async function adminMintCreditReferralCode(
  input: z.infer<typeof adminMintCreditReferralCodeSchema>
) {
  const code = crypto.randomUUID();

  const { amountInDollars, expiresAt } = input;

  const referralCode = await db.referralCode.create({
    data: {
      code,
      echoAppId: null,
      grantType: ReferralCodeType.CREDITS,
      grantAmount: amountInDollars,
      reusable: false,
      expiresAt,
    },
  });

  return {
    code: referralCode.code,
    grantAmount: referralCode.grantAmount,
    expiresAt: referralCode.expiresAt,
  };
}

export const downloadUsersCsvSchema = z.object({
  createdAfter: z.date(),
});

export async function downloadUsersCsv(
  input: z.infer<typeof downloadUsersCsvSchema>
) {
  const users = await db.user.findMany({
    where: {
      createdAt: {
        gte: input.createdAfter,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const csvData = [
    ['ID', 'Name', 'Email', 'Created At'],
    ...users.map(user => [
      user.id,
      user.name || '',
      user.email,
      user.createdAt.toISOString(),
    ]),
  ];

  const csvString = csvData
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return {
    csvString,
    filename: `users-created-after-${input.createdAfter.toISOString().split('T')[0]}.csv`,
    userCount: users.length,
  };
}

// Export user earnings aggregation functions
export {
  getUserEarningsAggregates,
  getAppTransactionAggregates,
  getAllUsersEarningsAggregates,
  getAllUsersEarningsAggregatesPaginated,
  getAppEarningsAcrossAllUsers,
};

// Export user spending aggregation functions
export {
  getUserSpendingAggregates,
  getAppSpendingAggregates,
  getAllUsersSpendingAggregates,
  getAllUsersSpendingAggregatesPaginated,
  getAppSpendingAcrossAllUsers,
};

// Export app transaction detail functions
export { getAppTransactionsPaginated, getAppTransactionTotals };

// Export user transaction detail functions
export { getUserTransactionsPaginated, getUserTransactionTotals };
