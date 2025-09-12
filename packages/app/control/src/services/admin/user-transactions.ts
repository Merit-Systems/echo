import { db } from '@/lib/db';
import { PaymentStatus } from '@/lib/payment-processing';

/**
 * User Transaction Details Service
 *
 * This service provides detailed transaction data for a specific user,
 * including pagination, running totals over time, and total paid amounts.
 *
 * Key functions:
 * - getUserTransactionsPaginated(userId, page, pageSize): Get paginated transactions for a user
 * - getUserTransactionTotals(userId): Get aggregate totals for a user across all apps
 */

// Interface for a single transaction with related data
interface UserTransactionDetail {
  id: string;
  totalCost: number;
  appProfit: number;
  markUpProfit: number;
  referralProfit: number;
  rawTransactionCost: number;
  status: string | null;
  createdAt: Date;
  // Running totals up to this transaction
  runningTotalSpent: number; // Cumulative total spent by the user (direct payments only, excludes free tier)
  runningTotalPaid: number; // Cumulative total paid by the user (from payments with spendPoolId null)
  // App information
  echoApp: {
    id: string;
    name: string;
  };
  // API Key information
  apiKey: {
    id: string;
    name: string | null;
  } | null;
  // Transaction metadata
  metadata: {
    id: string;
    providerId: string;
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    toolCost: number;
  } | null;
  // Spend pool information
  spendPool: {
    id: string;
    name: string;
  } | null;
}

// Interface for paginated transaction results
interface UserTransactionsPaginated {
  transactions: UserTransactionDetail[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  // Running totals up to this page
  runningTotals: {
    totalCost: number;
    totalTransactions: number;
    totalTokens: number;
    totalToolCost: number;
  };
}

// Interface for user transaction totals
interface UserTransactionTotals {
  userId: string;
  userName: string | null;
  userEmail: string;
  totalTransactions: number;
  totalCost: number;
  totalAppProfit: number;
  totalMarkUpProfit: number;
  totalReferralProfit: number;
  totalRawTransactionCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalToolCost: number;
  totalPaid: number; // Total amount paid via credit payments
  uniqueApps: number;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
}

/**
 * Get paginated transactions for a specific user with running totals
 */
export async function getUserTransactionsPaginated(
  userId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<UserTransactionsPaginated> {
  // Validate pagination parameters
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100); // Max 100 per page
  const offset = (validPage - 1) * validPageSize;

  // Get user info first to validate it exists
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  // Get total count for pagination
  const totalCount = await db.transaction.count({
    where: {
      userId: userId,
      isArchived: false,
    },
  });

  // Get paginated transactions with all related data
  const transactions = await db.transaction.findMany({
    where: {
      userId: userId,
      isArchived: false,
    },
    include: {
      echoApp: {
        select: {
          id: true,
          name: true,
        },
      },
      apiKey: {
        select: {
          id: true,
          name: true,
        },
      },
      transactionMetadata: {
        select: {
          id: true,
          providerId: true,
          provider: true,
          model: true,
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
          toolCost: true,
        },
      },
      spendPool: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Most recent first
    },
    skip: offset,
    take: validPageSize,
  });

  // Calculate running totals for each transaction
  const transactionDetails: UserTransactionDetail[] = [];

  for (const transaction of transactions) {
    // Calculate running total spent by the user up to this transaction (only direct payments, not free tier)
    const runningTotalSpent = await db.transaction.aggregate({
      where: {
        userId: userId,
        isArchived: false,
        spendPoolId: null, // Only include direct payment transactions, exclude free tier
        createdAt: {
          lte: transaction.createdAt,
        },
      },
      _sum: {
        totalCost: true,
      },
    });

    // Calculate running total paid by the user up to this transaction (only payments with spendPoolId null)
    const runningTotalPaid = await db.payment.aggregate({
      where: {
        userId: userId,
        spendPoolId: null, // Only count direct payments, not spend pool payments
        status: PaymentStatus.COMPLETED,
        isArchived: false,
        createdAt: {
          lte: transaction.createdAt,
        },
      },
      _sum: {
        amount: true,
      },
    });

    transactionDetails.push({
      id: transaction.id,
      totalCost: Number(transaction.totalCost),
      appProfit: Number(transaction.appProfit),
      markUpProfit: Number(transaction.markUpProfit),
      referralProfit: Number(transaction.referralProfit),
      rawTransactionCost: Number(transaction.rawTransactionCost),
      status: transaction.status,
      createdAt: transaction.createdAt,
      runningTotalSpent: Number(runningTotalSpent._sum.totalCost || 0),
      runningTotalPaid: Number(runningTotalPaid._sum.amount || 0),
      echoApp: transaction.echoApp,
      apiKey: transaction.apiKey,
      metadata: transaction.transactionMetadata
        ? {
            id: transaction.transactionMetadata.id,
            providerId: transaction.transactionMetadata.providerId,
            provider: transaction.transactionMetadata.provider,
            model: transaction.transactionMetadata.model,
            inputTokens: transaction.transactionMetadata.inputTokens,
            outputTokens: transaction.transactionMetadata.outputTokens,
            totalTokens: transaction.transactionMetadata.totalTokens,
            toolCost: Number(transaction.transactionMetadata.toolCost),
          }
        : null,
      spendPool: transaction.spendPool,
    });
  }

  // Calculate running totals up to and including this page
  const runningTotalsQuery = await db.transaction.aggregate({
    where: {
      userId: userId,
      isArchived: false,
      createdAt: {
        gte:
          transactions.length > 0
            ? transactions[transactions.length - 1].createdAt
            : new Date(),
      },
    },
    _sum: {
      totalCost: true,
      rawTransactionCost: true,
    },
    _count: {
      id: true,
    },
  });

  // Get token and tool cost totals with a separate query
  const tokenTotals = await db.$queryRaw<
    Array<{
      totalTokens: bigint | null;
      totalToolCost: string;
    }>
  >`
    SELECT 
      COALESCE(SUM(tm."totalTokens"), 0)::bigint as "totalTokens",
      COALESCE(SUM(tm."toolCost"), 0)::text as "totalToolCost"
    FROM transactions t
    LEFT JOIN transaction_metadata tm ON t."transactionMetadataId" = tm.id AND tm."isArchived" = false
    WHERE t."userId" = ${userId}::uuid
      AND t."isArchived" = false
      AND t."createdAt" >= ${transactions.length > 0 ? transactions[transactions.length - 1].createdAt : new Date()}
  `;

  const runningTotals = {
    totalCost: Number(runningTotalsQuery._sum.totalCost || 0),
    totalTransactions: runningTotalsQuery._count.id,
    totalTokens: Number(tokenTotals[0]?.totalTokens || 0),
    totalToolCost: Number(tokenTotals[0]?.totalToolCost || 0),
  };

  const totalPages = Math.ceil(totalCount / validPageSize);

  return {
    transactions: transactionDetails,
    pagination: {
      page: validPage,
      pageSize: validPageSize,
      total: totalCount,
      totalPages,
      hasNext: validPage < totalPages,
      hasPrevious: validPage > 1,
    },
    runningTotals,
  };
}

/**
 * Get comprehensive totals for a user across all apps
 */
export async function getUserTransactionTotals(
  userId: string
): Promise<UserTransactionTotals> {
  // Get user info
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, totalPaid: true },
  });

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  // Get comprehensive aggregates across all apps
  const [aggregates] = await db.$queryRaw<
    Array<{
      transactionCount: bigint;
      totalCost: string;
      appProfit: string;
      markUpProfit: string;
      referralProfit: string;
      rawTransactionCost: string;
      totalInputTokens: bigint | null;
      totalOutputTokens: bigint | null;
      totalTokens: bigint | null;
      totalToolCost: string;
      uniqueApps: bigint;
      earliestTransaction: Date | null;
      latestTransaction: Date | null;
    }>
  >`
    SELECT 
      COUNT(t.id)::bigint as "transactionCount",
      COALESCE(SUM(t."totalCost"), 0)::text as "totalCost",
      COALESCE(SUM(t."appProfit"), 0)::text as "appProfit",
      COALESCE(SUM(t."markUpProfit"), 0)::text as "markUpProfit",
      COALESCE(SUM(t."referralProfit"), 0)::text as "referralProfit",
      COALESCE(SUM(t."rawTransactionCost"), 0)::text as "rawTransactionCost",
      COALESCE(SUM(tm."inputTokens"), 0)::bigint as "totalInputTokens",
      COALESCE(SUM(tm."outputTokens"), 0)::bigint as "totalOutputTokens",
      COALESCE(SUM(tm."totalTokens"), 0)::bigint as "totalTokens",
      COALESCE(SUM(tm."toolCost"), 0)::text as "totalToolCost",
      COUNT(DISTINCT t."echoAppId")::bigint as "uniqueApps",
      MIN(t."createdAt") as "earliestTransaction",
      MAX(t."createdAt") as "latestTransaction"
    FROM transactions t
    LEFT JOIN transaction_metadata tm ON t."transactionMetadataId" = tm.id AND tm."isArchived" = false
    WHERE t."userId" = ${userId}::uuid
      AND t."isArchived" = false
  `;

  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    totalTransactions: Number(aggregates.transactionCount),
    totalCost: Number(aggregates.totalCost),
    totalAppProfit: Number(aggregates.appProfit),
    totalMarkUpProfit: Number(aggregates.markUpProfit),
    totalReferralProfit: Number(aggregates.referralProfit),
    totalRawTransactionCost: Number(aggregates.rawTransactionCost),
    totalInputTokens: Number(aggregates.totalInputTokens || 0),
    totalOutputTokens: Number(aggregates.totalOutputTokens || 0),
    totalTokens: Number(aggregates.totalTokens || 0),
    totalToolCost: Number(aggregates.totalToolCost),
    totalPaid: Number(user.totalPaid), // This comes from the totalPaid field in the User model
    uniqueApps: Number(aggregates.uniqueApps),
    dateRange: {
      earliest: aggregates.earliestTransaction,
      latest: aggregates.latestTransaction,
    },
  };
}
