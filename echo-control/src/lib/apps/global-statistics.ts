import { db } from '@/lib/db';
import type { GlobalStatistics } from './types';
import type { Prisma } from '@/generated/prisma';
import { getAppActivity, getAppActivityBatch } from './app-activity';
import { getModelUsage, getModelUsageBatch } from './model-usage';
import {
  getGlobalFreeTierSpendPoolInfo,
  getGlobalFreeTierSpendPoolInfoBatch,
} from '../spend-pools/fetch-user-spend';

/**
 * Get global statistics for an echo app
 * @param echoAppId - The ID of the echo app
 * @param tx - Optional Prisma transaction client
 * @returns Global statistics including totals, activity data, and model usage
 */
export async function getGlobalStatistics(
  echoAppId: string,
  tx?: Prisma.TransactionClient
): Promise<GlobalStatistics> {
  const client = tx ?? db;

  // Use raw SQL to get all aggregated data in a single query
  const [aggregatedResult] = await client.$queryRaw<
    Array<{
      totalTransactions: bigint;
      totalRevenue: string;
      totalTokens: bigint | null;
      totalInputTokens: bigint | null;
      totalOutputTokens: bigint | null;
    }>
  >`
    SELECT 
      COUNT(t.id)::bigint as "totalTransactions",
      COALESCE(SUM(t."totalCost"), 0)::text as "totalRevenue",
      COALESCE(SUM(tm."totalTokens"), 0)::bigint as "totalTokens",
      COALESCE(SUM(tm."inputTokens"), 0)::bigint as "totalInputTokens", 
      COALESCE(SUM(tm."outputTokens"), 0)::bigint as "totalOutputTokens"
    FROM transactions t
    LEFT JOIN transaction_metadata tm ON t."transactionMetadataId" = tm.id AND tm."isArchived" = false
    WHERE t."echoAppId" = ${echoAppId}::uuid
      AND t."isArchived" = false
  `;

  // Get activity data and model usage
  const [globalActivityData, globalModelUsage, freeTierSpendPoolInfo] =
    await Promise.all([
      getAppActivity(echoAppId, 7, undefined, client),
      getModelUsage(echoAppId, undefined, client),
      getGlobalFreeTierSpendPoolInfo(echoAppId, client),
    ]);

  return {
    globalTotalTransactions: Number(aggregatedResult?.totalTransactions ?? 0),
    globalTotalRevenue: Number(aggregatedResult?.totalRevenue ?? 0),
    globalTotalTokens: Number(aggregatedResult?.totalTokens ?? 0),
    globalTotalInputTokens: Number(aggregatedResult?.totalInputTokens ?? 0),
    globalTotalOutputTokens: Number(aggregatedResult?.totalOutputTokens ?? 0),
    globalActivityData,
    globalModelUsage,
    globalFreetierSpendPoolPerUserLimit:
      freeTierSpendPoolInfo.perUserSpendLimit,
    globalFreeTierSpendPoolBalance: freeTierSpendPoolInfo.spendPoolBalance,
  };
}

/**
 * Batch fetch global statistics for multiple echo apps
 * This is optimized to minimize database queries by fetching all data at once
 * @param echoAppIds - Array of echo app IDs
 * @param tx - Optional Prisma transaction client
 * @returns Map of echo app ID to global statistics
 */
export async function getGlobalStatisticsBatch(
  echoAppIds: string[],
  tx?: Prisma.TransactionClient
): Promise<Map<string, GlobalStatistics>> {
  const client = tx ?? db;

  // If no app IDs provided, return empty map
  if (echoAppIds.length === 0) {
    return new Map();
  }

  // Use raw SQL to get all aggregated data in a single query
  // This joins transactions with transaction_metadata and groups by echoAppId
  const aggregatedResults = await client.$queryRaw<
    Array<{
      echoAppId: string;
      totalTransactions: bigint;
      totalRevenue: string;
      totalTokens: bigint | null;
      totalInputTokens: bigint | null;
      totalOutputTokens: bigint | null;
    }>
  >`
    SELECT 
      t."echoAppId",
      COUNT(t.id)::bigint as "totalTransactions",
      COALESCE(SUM(t."totalCost"), 0)::text as "totalRevenue",
      COALESCE(SUM(tm."totalTokens"), 0)::bigint as "totalTokens",
      COALESCE(SUM(tm."inputTokens"), 0)::bigint as "totalInputTokens", 
      COALESCE(SUM(tm."outputTokens"), 0)::bigint as "totalOutputTokens"
    FROM transactions t
    LEFT JOIN transaction_metadata tm ON t."transactionMetadataId" = tm.id AND tm."isArchived" = false
    WHERE t."echoAppId" = ANY(${echoAppIds}::uuid[])
      AND t."isArchived" = false
    GROUP BY t."echoAppId"
  `;

  // Batch fetch activity data and model usage for all apps
  const [activityDataMap, modelUsageMap, userSpendStatisticsMap] =
    await Promise.all([
      getAppActivityBatch(echoAppIds, 7, undefined, client),
      getModelUsageBatch(echoAppIds, undefined, client),
      getGlobalFreeTierSpendPoolInfoBatch(echoAppIds, client),
    ]);

  // Batch fetch user spend statistics for all apps
  // Create result map with aggregated data
  const resultMap = new Map<string, GlobalStatistics>();

  // Create a map for quick lookup of aggregated results
  const aggregatedMap = new Map(
    aggregatedResults.map(result => [result.echoAppId, result])
  );

  // Process each app ID and build the statistics
  for (const appId of echoAppIds) {
    const aggregated = aggregatedMap.get(appId);
    const globalActivityData = activityDataMap.get(appId) ?? [];
    const globalModelUsage = modelUsageMap.get(appId) ?? [];

    resultMap.set(appId, {
      globalTotalTransactions: Number(aggregated?.totalTransactions ?? 0),
      globalTotalRevenue: Number(aggregated?.totalRevenue ?? 0),
      globalTotalTokens: Number(aggregated?.totalTokens ?? 0),
      globalTotalInputTokens: Number(aggregated?.totalInputTokens ?? 0),
      globalTotalOutputTokens: Number(aggregated?.totalOutputTokens ?? 0),
      globalActivityData,
      globalModelUsage,
      globalFreetierSpendPoolPerUserLimit:
        userSpendStatisticsMap.get(appId)?.perUserSpendLimit ?? null,
      globalFreeTierSpendPoolBalance:
        userSpendStatisticsMap.get(appId)?.spendPoolBalance ?? 0,
    });
  }

  return resultMap;
}
