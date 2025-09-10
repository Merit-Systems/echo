import { db } from '@/lib/db';
import type {} from '@/generated/prisma';

/**
 * App Transaction Details Service
 *
 * This service provides detailed transaction data for a specific app,
 * including pagination and running totals over time.
 *
 * Key functions:
 * - getAppTransactionsPaginated(appId, page, pageSize): Get paginated transactions for an app
 * - getAppTransactionTotals(appId): Get aggregate totals for an app
 */

// Interface for a single transaction with related data
interface AppTransactionDetail {
  id: string;
  totalCost: number;
  appProfit: number;
  markUpProfit: number;
  referralProfit: number;
  rawTransactionCost: number;
  status: string | null;
  createdAt: Date;
  // Running totals up to this transaction
  runningTotalSpent: number; // Cumulative total spent on the app
  // User information
  user: {
    id: string;
    name: string | null;
    email: string;
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
interface AppTransactionsPaginated {
  transactions: AppTransactionDetail[];
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

// Interface for app transaction totals
interface AppTransactionTotals {
  appId: string;
  appName: string;
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
  uniqueUsers: number;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
}

/**
 * Get paginated transactions for a specific app with running totals per user
 */
export async function getAppTransactionsPaginated(
  appId: string,
  page = 1,
  pageSize = 50
): Promise<AppTransactionsPaginated> {
  // Validate pagination parameters
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100); // Max 100 per page
  const offset = (validPage - 1) * validPageSize;

  // Get app info first to validate it exists
  const app = await db.echoApp.findUnique({
    where: { id: appId },
    select: { id: true, name: true },
  });

  if (!app) {
    throw new Error(`App with id ${appId} not found`);
  }

  // Get total count for pagination
  const totalCount = await db.transaction.count({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
  });

  // Get paginated transactions with all related data
  const transactions = await db.transaction.findMany({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
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
  const transactionDetails: AppTransactionDetail[] = [];

  for (const transaction of transactions) {
    // Calculate running total spent on the app up to this transaction
    const runningTotalSpent = await db.transaction.aggregate({
      where: {
        echoAppId: appId,
        isArchived: false,
        createdAt: {
          lte: transaction.createdAt,
        },
      },
      _sum: {
        totalCost: true,
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
      user: transaction.user,
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
      echoAppId: appId,
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
    WHERE t."echoAppId" = ${appId}::uuid
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
 * Get comprehensive totals for an app
 */
export async function getAppTransactionTotals(
  appId: string
): Promise<AppTransactionTotals> {
  // Get app info
  const app = await db.echoApp.findUnique({
    where: { id: appId },
    select: { id: true, name: true },
  });

  if (!app) {
    throw new Error(`App with id ${appId} not found`);
  }

  // Get comprehensive aggregates
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
      uniqueUsers: bigint;
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
      COUNT(DISTINCT t."userId")::bigint as "uniqueUsers",
      MIN(t."createdAt") as "earliestTransaction",
      MAX(t."createdAt") as "latestTransaction"
    FROM transactions t
    LEFT JOIN transaction_metadata tm ON t."transactionMetadataId" = tm.id AND tm."isArchived" = false
    WHERE t."echoAppId" = ${appId}::uuid
      AND t."isArchived" = false
  `;

  return {
    appId: app.id,
    appName: app.name,
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
    uniqueUsers: Number(aggregates.uniqueUsers),
    dateRange: {
      earliest: aggregates.earliestTransaction,
      latest: aggregates.latestTransaction,
    },
  };
}
