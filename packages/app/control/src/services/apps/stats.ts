import z from 'zod';

import { db } from '@/lib/db';

import { userIdSchema } from '../lib/schemas';
import { appIdSchema } from './lib/schemas';

export const getBucketedAppStatsSchema = z.object({
  appId: appIdSchema,
  startDate: z.date(),
  endDate: z.date(),
  numBuckets: z.number().optional().default(48),
  userId: userIdSchema.optional(),
});

export const getBucketedAppStats = async ({
  appId,
  startDate,
  endDate,
  numBuckets,
  userId,
}: z.infer<typeof getBucketedAppStatsSchema>) => {
  // Get all transactions for the time period
  const transactions = await db.transaction.findMany({
    where: {
      echoAppId: appId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      isArchived: false,
      ...(userId && { userId }),
    },
    select: {
      transactionMetadata: true,
      rawTransactionCost: true,
      markUpProfit: true,
      createdAt: true,
    },
  });

  // Calculate bucket size in milliseconds
  const totalMs = endDate.getTime() - startDate.getTime();
  const bucketSizeMs = Math.floor(totalMs / numBuckets);

  // Initialize buckets
  const buckets = Array.from({ length: numBuckets }, (_, i) => {
    const bucketStart = new Date(startDate.getTime() + i * bucketSizeMs);
    return {
      timestamp: bucketStart,
      totalCost: 0,
      totalTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalProfit: 0,
      transactionCount: 0,
    };
  });

  // Group transactions into buckets
  for (const transaction of transactions) {
    const bucketIndex = Math.floor(
      (transaction.createdAt.getTime() - startDate.getTime()) / bucketSizeMs
    );

    if (bucketIndex >= 0 && bucketIndex < numBuckets) {
      const bucket = buckets[bucketIndex];
      bucket.totalCost += Number(transaction.rawTransactionCost);
      bucket.totalProfit += Number(transaction.markUpProfit);
      bucket.transactionCount += 1;
      // Extract token information from transactionMetadata
      if (transaction.transactionMetadata) {
        const metadata = transaction.transactionMetadata;

        if (metadata.totalTokens) {
          bucket.totalTokens += Number(metadata.totalTokens);
        }
        if (metadata.inputTokens) {
          bucket.totalInputTokens += Number(metadata.inputTokens);
        }
        if (metadata.outputTokens) {
          bucket.totalOutputTokens += Number(metadata.outputTokens);
        }
      }
    }
  }

  return buckets;
};

export const getOverallAppStatsSchema = z.object({
  appId: appIdSchema,
  userId: userIdSchema.optional(),
});

export const getOverallAppStats = async ({
  appId,
  userId,
}: z.infer<typeof getOverallAppStatsSchema>) => {
  const [transactionStats, metadataStats, numUsers] = await Promise.all([
    db.transaction.aggregate({
      where: {
        echoAppId: appId,
        ...(userId && { userId }),
      },
      _sum: {
        totalCost: true,
        markUpProfit: true,
      },
      _count: {
        id: true,
        userId: true,
      },
    }),
    db.transactionMetadata.aggregate({
      where: {
        transactions: {
          every: {
            echoAppId: appId,
          },
        },
        ...(userId && { userId }),
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
      },
    }),
    userId
      ? Promise.resolve(1)
      : db.transaction
          .groupBy({
            by: ['userId'],
            where: {
              echoAppId: appId,
            },
            _count: {
              userId: true,
            },
          })
          .then(groups => groups.length),
  ]);

  return {
    totalCost: Number(transactionStats._sum.totalCost),
    totalProfit: Number(transactionStats._sum.markUpProfit),
    transactionCount: Number(transactionStats._count.id),
    totalInputTokens: Number(metadataStats._sum.inputTokens),
    totalOutputTokens: Number(metadataStats._sum.outputTokens),
    totalTokens: Number(metadataStats._sum.totalTokens),
    numUsers: Number(numUsers),
  };
};
