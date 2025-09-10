import { db } from '@/lib/db';
import type { AppActivity } from './types';
import { Prisma } from '@/generated/prisma';

/**
 * Get app activity data for a given time period
 * @param echoAppId - The ID of the echo app
 * @param lookbackDays - Number of days to look back (default: 7)
 * @param userId - Optional user ID to filter transactions
 * @param tx - Optional Prisma transaction client
 * @returns Array of AppActivity data for each day
 */
export async function getAppActivity(
  echoAppId: string,
  lookbackDays = 7,
  userId?: string,
  tx?: Prisma.TransactionClient
): Promise<AppActivity[]> {
  const client = tx || db;

  // Generate array of the last N days
  const days = Array.from({ length: lookbackDays }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0); // Start of day
    return date;
  }).reverse(); // Oldest first

  // Get all transactions for the time period
  const startDate = days[0];
  const endDate = new Date(days[days.length - 1]);
  endDate.setDate(endDate.getDate() + 1); // End of last day

  const transactions = await client.transaction.findMany({
    where: {
      echoAppId,
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
      isArchived: false,
      // Filter by user if provided
      ...(userId && { userId }),
    },
    select: {
      totalCost: true,
      transactionMetadata: true,
      createdAt: true,
    },
  });

  // Group transactions by day and calculate activity for each day
  return days.map(dayStart => {
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayTransactions = transactions.filter(
      tx => tx.createdAt >= dayStart && tx.createdAt < dayEnd
    );

    // Calculate totals for the day
    let totalCost = new Prisma.Decimal(0);
    let totalTokens = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (const transaction of dayTransactions) {
      // Add to total cost
      const cost = new Prisma.Decimal(transaction.totalCost.toString());
      totalCost = totalCost.add(cost);

      // Extract token information from metadata
      const metadata = transaction.transactionMetadata;
      if (metadata) {
        // Token counts
        if (metadata.totalTokens) {
          totalTokens += Number(metadata.totalTokens);
        }
        if (metadata.inputTokens) {
          totalInputTokens += Number(metadata.inputTokens);
        }
        if (metadata.outputTokens) {
          totalOutputTokens += Number(metadata.outputTokens);
        }
      }
    }

    return {
      timestamp: dayStart,
      totalCost: Number(totalCost.toFixed(14)),
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
    };
  });
}

/**
 * Batch fetch app activity data for multiple echo apps
 * This is optimized to fetch all transactions in a single query
 * @param echoAppIds - Array of echo app IDs
 * @param lookbackDays - Number of days to look back (default: 7)
 * @param userId - Optional user ID to filter transactions
 * @param tx - Optional Prisma transaction client
 * @returns Map of echo app ID to array of AppActivity data
 */
export async function getAppActivityBatch(
  echoAppIds: string[],
  lookbackDays = 7,
  userId?: string,
  tx?: Prisma.TransactionClient
): Promise<Map<string, AppActivity[]>> {
  const client = tx || db;

  // Generate array of the last N days
  const days = Array.from({ length: lookbackDays }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0); // Start of day
    return date;
  }).reverse(); // Oldest first

  // Get all transactions for all apps in the time period
  const startDate = days[0];
  const endDate = new Date(days[days.length - 1]);
  endDate.setDate(endDate.getDate() + 1); // End of last day

  const allTransactions = await client.transaction.findMany({
    where: {
      echoAppId: { in: echoAppIds },
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
      isArchived: false,
      // Filter by user if provided
      ...(userId && { userId }),
    },
    select: {
      echoAppId: true,
      totalCost: true,
      transactionMetadata: true,
      createdAt: true,
    },
  });

  // Initialize result map
  const activityMap = new Map<string, AppActivity[]>();

  // Process each app
  for (const appId of echoAppIds) {
    // Filter transactions for this app
    const appTransactions = allTransactions.filter(
      tx => tx.echoAppId === appId
    );

    // Calculate activity for each day
    const appActivity = days.map(dayStart => {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayTransactions = appTransactions.filter(
        tx => tx.createdAt >= dayStart && tx.createdAt < dayEnd
      );

      // Calculate totals for the day
      let totalCost = new Prisma.Decimal(0);
      let totalTokens = 0;
      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      for (const transaction of dayTransactions) {
        // Add to total cost
        const cost = new Prisma.Decimal(transaction.totalCost.toString());
        totalCost = totalCost.add(cost);

        // Extract token information from metadata
        const metadata = transaction.transactionMetadata;
        if (metadata) {
          // Token counts
          if (metadata.totalTokens) {
            totalTokens += Number(metadata.totalTokens);
          }
          if (metadata.inputTokens) {
            totalInputTokens += Number(metadata.inputTokens);
          }
          if (metadata.outputTokens) {
            totalOutputTokens += Number(metadata.outputTokens);
          }
        }
      }

      return {
        timestamp: dayStart,
        totalCost: Number(totalCost.toFixed(14)),
        totalTokens,
        totalInputTokens,
        totalOutputTokens,
      };
    });

    activityMap.set(appId, appActivity);
  }

  return activityMap;
}
