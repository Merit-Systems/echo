import { db } from '@/lib/db';
import type { OwnerStatistics, CustomerApiKey } from './types';
import type { Prisma, Transaction } from '@/generated/prisma';
import {
  getCustomerStatistics,
  getCustomerStatisticsBatch,
} from './customer-statistics';
import { serializeTransactions } from '@/lib/utils/serialization';
import {
  getGlobalUserSpendInfoForApp,
  getGlobalUserSpendInfoForAppBatch,
} from '../spend-pools/fetch-user-spend';

const RECENT_TRANSACTIONS_LIMIT = 10;

/**
 * Get owner statistics for an echo app
 * @param echoAppId - The ID of the echo app
 * @param ownerId - The ID of the owner
 * @param tx - Optional Prisma transaction client
 * @returns Owner statistics including global, personal, and owner-specific data
 */
export async function getOwnerStatistics(
  echoAppId: string,
  ownerId: string,
  tx?: Prisma.TransactionClient
): Promise<OwnerStatistics> {
  const client = tx || db;

  // Get customer statistics first (includes both global and personal stats)
  const customerStats = await getCustomerStatistics(echoAppId, ownerId, client);

  // Get all API keys for this app (global)
  const globalApiKeys: CustomerApiKey[] = await client.apiKey.findMany({
    where: {
      echoAppId,
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
      // Excluding metadata to avoid serialization issues
      // metadata: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get recent global transactions for this app
  const recentGlobalTransactions: Transaction[] =
    await client.transaction.findMany({
      where: {
        echoAppId,
        isArchived: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: RECENT_TRANSACTIONS_LIMIT,
    });

  const personalUserSpendStatistics = await getGlobalUserSpendInfoForApp(
    echoAppId,
    client
  );

  // Combine all statistics
  return {
    ...customerStats,
    globalApiKeys,
    recentGlobalTransactions: serializeTransactions(recentGlobalTransactions),
    globalUserSpendStatistics: personalUserSpendStatistics.userSpendInfo,
  };
}

/**
 * Batch fetch owner statistics for multiple echo apps owned by a specific user
 * This is optimized to minimize database queries by fetching all data at once
 * @param echoAppIds - Array of echo app IDs
 * @param ownerId - The ID of the owner
 * @param tx - Optional Prisma transaction client
 * @returns Map of echo app ID to owner statistics
 */
export async function getOwnerStatisticsBatch(
  echoAppIds: string[],
  ownerId: string,
  tx?: Prisma.TransactionClient
): Promise<Map<string, OwnerStatistics>> {
  const client = tx || db;

  // Step 1: Get customer statistics for all apps (includes both global and personal stats)
  const customerStatsMap = await getCustomerStatisticsBatch(
    echoAppIds,
    ownerId,
    client
  );

  // Step 2: Get all API keys for all apps (global) in one query
  const allGlobalApiKeys = await client.apiKey.findMany({
    where: {
      echoAppId: { in: echoAppIds },
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
      // Excluding metadata to avoid serialization issues
      // metadata: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Group API keys by app
  const globalApiKeysByApp = new Map<string, CustomerApiKey[]>();
  for (const appId of echoAppIds) {
    globalApiKeysByApp.set(appId, []);
  }
  for (const apiKey of allGlobalApiKeys) {
    const appKeys = globalApiKeysByApp.get(apiKey.echoAppId);
    if (appKeys) {
      appKeys.push(apiKey);
    }
  }

  // Step 3: Get recent global transactions for all apps in one query
  const allRecentGlobalTransactions = await client.transaction.findMany({
    where: {
      echoAppId: { in: echoAppIds },
      isArchived: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Group and limit transactions by app
  const recentGlobalTransactionsByApp = new Map<string, Transaction[]>();
  for (const appId of echoAppIds) {
    const appTransactions = allRecentGlobalTransactions
      .filter(t => t.echoAppId === appId)
      .slice(0, RECENT_TRANSACTIONS_LIMIT);
    recentGlobalTransactionsByApp.set(appId, appTransactions);
  }

  const personalUserSpendStatisticsMap =
    await getGlobalUserSpendInfoForAppBatch(echoAppIds, client);

  // Step 4: Combine all statistics
  const resultMap = new Map<string, OwnerStatistics>();

  for (const appId of echoAppIds) {
    const customerStats = customerStatsMap.get(appId);
    const globalApiKeys = globalApiKeysByApp.get(appId) || [];
    const recentGlobalTransactions =
      recentGlobalTransactionsByApp.get(appId) || [];

    if (!customerStats) {
      console.error(`Missing customer stats for app ${appId}`);
      continue;
    }

    resultMap.set(appId, {
      ...customerStats,
      globalApiKeys,
      recentGlobalTransactions: serializeTransactions(recentGlobalTransactions),
      globalUserSpendStatistics:
        personalUserSpendStatisticsMap.get(appId)?.userSpendInfo || [],
    });
  }

  return resultMap;
}
