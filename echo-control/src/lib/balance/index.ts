import { db } from '../db';
import { User } from '@/generated/prisma';
import {
  calculateBalanceFromCreditGrants,
  calculateAppSpecificBalanceFromCreditGrants,
} from '../credit-grants';
import { BalanceResult, EnhancedBalanceResult } from './types';

/**
 * Get balance for a user using credit grants system
 * @param user - The authenticated user
 * @param echoAppId - Optional app ID to get app-specific balance (uses traditional calculation)
 * @returns Balance information
 */
export async function getBalance(
  user: User,
  echoAppId?: string | null
): Promise<BalanceResult> {
  let balance: number;
  let totalPaid: number;
  let totalSpent: number;
  let echoAppName: string | null = null;

  if (echoAppId) {
    // App-specific balance: use global credit grants (same as global balance)
    // Debits maintain app reference via transactionId for audit purposes
    const appMembership = await db.appMembership.findUnique({
      where: {
        userId_echoAppId: {
          userId: user.id,
          echoAppId: echoAppId,
        },
      },
      include: {
        echoApp: true,
      },
    });

    if (!appMembership) {
      throw new Error('App membership not found');
    }

    echoAppName = appMembership.echoApp?.name || null;

    // Calculate balance using global credit grants (credits and debits are both global)
    const appCreditGrantBalance =
      await calculateAppSpecificBalanceFromCreditGrants(user.id, echoAppId);

    balance = appCreditGrantBalance.balance;
    totalPaid = appCreditGrantBalance.totalCredits;
    totalSpent = appCreditGrantBalance.totalDebits;
  } else {
    // Global balance: use credit grants system
    const creditGrantBalance = await calculateBalanceFromCreditGrants(user.id);

    balance = creditGrantBalance.balance;
    totalPaid = creditGrantBalance.totalCredits;
    totalSpent = creditGrantBalance.totalDebits;
  }

  return {
    balance,
    totalPaid,
    totalSpent,
    currency: 'USD',
    echoAppId: echoAppId || null,
    echoAppName,
  };
}

/**
 * Get enhanced balance for a user with detailed credit grant information
 * @param user - The authenticated user
 * @param options - Configuration options
 * @returns Enhanced balance information with credit grant breakdown
 */
export async function getEnhancedBalance(
  user: User,
  options: {
    includeExpiredCredits?: boolean;
    echoAppId?: string | null;
  } = {}
): Promise<EnhancedBalanceResult> {
  const { includeExpiredCredits = false, echoAppId } = options;

  // Get the base balance
  const baseBalance = await getBalance(user, echoAppId);

  if (!echoAppId) {
    // For global balance, provide detailed credit grant information
    const creditGrantData = await calculateBalanceFromCreditGrants(
      user.id,
      includeExpiredCredits
    );

    return {
      ...baseBalance,
      balance: creditGrantData.balance,
      usedCreditGrants: true,
      creditGrantData: {
        totalCredits: creditGrantData.totalCredits,
        totalDebits: creditGrantData.totalDebits,
        activeCredits: creditGrantData.activeCredits,
        expiredCredits: creditGrantData.expiredCredits,
      },
    };
  } else {
    // For app-specific balance, provide global credit grant information (same as global)
    const appCreditGrantData =
      await calculateAppSpecificBalanceFromCreditGrants(
        user.id,
        echoAppId,
        includeExpiredCredits
      );

    return {
      ...baseBalance,
      balance: appCreditGrantData.balance,
      usedCreditGrants: true,
      creditGrantData: {
        totalCredits: appCreditGrantData.totalCredits,
        totalDebits: appCreditGrantData.totalDebits,
        activeCredits: appCreditGrantData.activeCredits,
        expiredCredits: appCreditGrantData.expiredCredits,
      },
    };
  }
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

export * from './types';
