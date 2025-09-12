import { db } from '@/lib/db';
import { CustomerStatistics, CustomerApiKey } from './types';
import { Prisma, Transaction } from '@/generated/prisma';
import {
  getGlobalStatistics,
  getGlobalStatisticsBatch,
} from './global-statistics';
import { getAppActivity, getAppActivityBatch } from './app-activity';
import { getModelUsage, getModelUsageBatch } from './model-usage';
import { serializeTransactions } from '@/lib/utils/serialization';
import {
  getCustomerSpendInfoForAppBatch,
  getCustomerSpendInfoForApp,
} from '../spend-pools/fetch-user-spend';

const RECENT_TRANSACTIONS_LIMIT = 10;

/**
 * Get customer statistics for an echo app
 * @param echoAppId - The ID of the echo app
 * @param userId - The ID of the user/customer
 * @param tx - Optional Prisma transaction client
 * @returns Customer statistics including both global and personal data
 */
export async function getCustomerStatistics(
  echoAppId: string,
  userId: string,
  tx?: Prisma.TransactionClient
): Promise<CustomerStatistics> {
  const client = tx || db;

  // Get global statistics first
  const globalStats = await getGlobalStatistics(echoAppId, client);

  // Get user's API keys for this app
  const apiKeys = (await client.apiKey.findMany({
    where: {
      echoAppId,
      userId,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      echoAppId: true,
      userId: true,
      isArchived: true,
      archivedAt: true,
      lastUsed: true,
    },
  })) as CustomerApiKey[];

  // Get user's transactions for this app
  const personalTransactions = await client.transaction.findMany({
    where: {
      echoAppId,
      userId,
      isArchived: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: RECENT_TRANSACTIONS_LIMIT, // Get recent transactions
  });

  // Calculate personal totals
  let personalTotalRevenue = 0;
  let personalTotalTokens = 0;
  let personalTotalInputTokens = 0;
  let personalTotalOutputTokens = 0;
  let personalTotalTransactions = 0;

  // Use raw SQL to get aggregated personal stats in a single query
  const [personalAggregatedResult] = await client.$queryRaw<
    Array<{
      totalRevenue: string;
      totalTokens: bigint | null;
      totalInputTokens: bigint | null;
      totalOutputTokens: bigint | null;
      totalTransactions: bigint | null;
    }>
  >`
    SELECT 
      COALESCE(SUM(t."totalCost"), 0)::text as "totalRevenue",
      COALESCE(SUM(tm."totalTokens"), 0)::bigint as "totalTokens",
      COALESCE(SUM(tm."inputTokens"), 0)::bigint as "totalInputTokens", 
      COALESCE(SUM(tm."outputTokens"), 0)::bigint as "totalOutputTokens",
      COUNT(t.id)::bigint as "totalTransactions"
    FROM transactions t
    LEFT JOIN transaction_metadata tm ON t."transactionMetadataId" = tm.id AND tm."isArchived" = false
    WHERE t."echoAppId" = ${echoAppId}::uuid
      AND t."userId" = ${userId}::uuid
      AND t."isArchived" = false
  `;

  personalTotalRevenue = Number(personalAggregatedResult?.totalRevenue || 0);
  personalTotalTokens = Number(personalAggregatedResult?.totalTokens || 0);
  personalTotalInputTokens = Number(
    personalAggregatedResult?.totalInputTokens || 0
  );
  personalTotalOutputTokens = Number(
    personalAggregatedResult?.totalOutputTokens || 0
  );
  personalTotalTransactions = Number(
    personalAggregatedResult?.totalTransactions || 0
  );
  // Get personal activity data (last 7 days)
  const personalActivityData = await getAppActivity(
    echoAppId,
    7,
    userId,
    client
  );

  // Get personal model usage
  const personalModelUsage = await getModelUsage(echoAppId, userId, client);

  const personalUserSpendStatistics = await getCustomerSpendInfoForApp(
    echoAppId,
    userId,
    client
  );

  return {
    // Spread global statistics
    ...globalStats,
    // Add personal statistics
    personalTotalRevenue,
    personalTotalTokens,
    personalTotalInputTokens,
    personalTotalOutputTokens,
    personalRecentTransactions: serializeTransactions(personalTransactions),
    personalModelUsage,
    personalActivityData,
    personalApiKeys: apiKeys,
    personalTotalTransactions,
    personalUserSpendStatistics: personalUserSpendStatistics.userSpendInfo,
  };
}

/**
 * Batch fetch customer statistics for multiple echo apps for a specific user
 * This is optimized to minimize database queries by fetching all data at once
 * @param echoAppIds - Array of echo app IDs
 * @param userId - The ID of the user/customer
 * @param tx - Optional Prisma transaction client
 * @returns Map of echo app ID to customer statistics
 */
export async function getCustomerStatisticsBatch(
  echoAppIds: string[],
  userId: string,
  tx?: Prisma.TransactionClient
): Promise<Map<string, CustomerStatistics>> {
  const client = tx || db;

  // Step 1: Get global statistics for all apps
  const globalStatsMap = await getGlobalStatisticsBatch(echoAppIds, client);

  // Step 2: Get all user's API keys for all apps in one query
  const allApiKeys = (await client.apiKey.findMany({
    where: {
      echoAppId: { in: echoAppIds },
      userId,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      echoAppId: true,
      userId: true,
      isArchived: true,
      archivedAt: true,
      lastUsed: true,
    },
  })) as CustomerApiKey[];

  // Group API keys by app
  const apiKeysByApp = new Map<string, CustomerApiKey[]>();
  for (const appId of echoAppIds) {
    apiKeysByApp.set(appId, []);
  }
  for (const apiKey of allApiKeys) {
    const appKeys = apiKeysByApp.get(apiKey.echoAppId);
    if (appKeys) {
      appKeys.push(apiKey as CustomerApiKey);
    }
  }

  // Step 3: Use raw SQL to get aggregated personal stats for all apps in one query
  const personalAggregatedResults = await client.$queryRaw<
    Array<{
      echoAppId: string;
      totalRevenue: string;
      totalTokens: bigint | null;
      totalInputTokens: bigint | null;
      totalOutputTokens: bigint | null;
      totalTransactions: bigint | null;
    }>
  >`
    SELECT 
      t."echoAppId",
      COALESCE(SUM(t."totalCost"), 0)::text as "totalRevenue",
      COALESCE(SUM(tm."totalTokens"), 0)::bigint as "totalTokens",
      COALESCE(SUM(tm."inputTokens"), 0)::bigint as "totalInputTokens", 
      COALESCE(SUM(tm."outputTokens"), 0)::bigint as "totalOutputTokens",
      COUNT(t.id)::bigint as "totalTransactions"
    FROM transactions t
    LEFT JOIN transaction_metadata tm ON t."transactionMetadataId" = tm.id AND tm."isArchived" = false
    WHERE t."echoAppId" = ANY(${echoAppIds}::uuid[])
      AND t."userId" = ${userId}::uuid
      AND t."isArchived" = false
    GROUP BY t."echoAppId"
  `;

  // Step 4: Get recent transactions for each app (still need individual queries for ordering and limiting)
  const recentTransactionsMap = new Map<string, Transaction[]>();

  // Get recent transactions for each app separately since we need ordering and limiting
  const recentTransactionPromises = echoAppIds.map(async appId => {
    const recentTransactions = await client.transaction.findMany({
      where: {
        echoAppId: appId,
        userId,
        isArchived: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: RECENT_TRANSACTIONS_LIMIT,
    });
    return { appId, transactions: recentTransactions };
  });

  const recentTransactionResults = await Promise.all(recentTransactionPromises);

  for (const result of recentTransactionResults) {
    recentTransactionsMap.set(result.appId, result.transactions);
  }

  // Step 5: Get personal activity data for all apps
  const personalActivityMap = await getAppActivityBatch(
    echoAppIds,
    7,
    userId,
    client
  );

  // Step 6: Get personal model usage for all apps
  const personalModelUsageMap = await getModelUsageBatch(
    echoAppIds,
    userId,
    client
  );

  const personalUserSpendStatisticsMap = await getCustomerSpendInfoForAppBatch(
    userId,
    echoAppIds,
    client
  );

  // Create lookup map for personal aggregated results
  const personalAggregatedMap = new Map(
    personalAggregatedResults.map(result => [result.echoAppId, result])
  );

  // Step 7: Combine all data into final statistics
  const resultMap = new Map<string, CustomerStatistics>();

  for (const appId of echoAppIds) {
    const globalStats = globalStatsMap.get(appId);
    const personalAggregated = personalAggregatedMap.get(appId);
    const personalApiKeys = apiKeysByApp.get(appId) || [];
    const personalActivityData = personalActivityMap.get(appId) || [];
    const personalModelUsage = personalModelUsageMap.get(appId) || [];
    const recentTransactions = recentTransactionsMap.get(appId) || [];
    const personalUserSpendStatistics = personalUserSpendStatisticsMap.get(
      appId
    )?.userSpendInfo || {
      userId,
      echoAppId: appId,
      spendPoolId: null,
      amountSpent: 0,
      spendLimit: null,
      amountLeft: 0,
    };

    if (!globalStats) {
      console.error(`Missing global stats for app ${appId}`);
      continue;
    }

    resultMap.set(appId, {
      // Spread global statistics
      ...globalStats,
      // Add personal statistics from aggregated results
      personalTotalRevenue: Number(personalAggregated?.totalRevenue || 0),
      personalTotalTokens: Number(personalAggregated?.totalTokens || 0),
      personalTotalInputTokens: Number(
        personalAggregated?.totalInputTokens || 0
      ),
      personalTotalOutputTokens: Number(
        personalAggregated?.totalOutputTokens || 0
      ),
      personalRecentTransactions: serializeTransactions(recentTransactions),
      personalModelUsage,
      personalActivityData,
      personalApiKeys,
      personalTotalTransactions: Number(
        personalAggregated?.totalTransactions || 0
      ),
      personalUserSpendStatistics,
    });
  }

  return resultMap;
}
