import z from 'zod';

import { db } from '@/lib/db';

export const getCreatorActivitySchema = z.object({
  userId: z.uuid(),
  startDate: z.date(),
  endDate: z.date(),
  numBuckets: z.number().optional().default(48),
  isCumulative: z.boolean().optional().default(false),
});

export const getCreatorActivity = async ({
  userId,
  startDate,
  endDate,
  numBuckets,
  isCumulative,
}: z.infer<typeof getCreatorActivitySchema>) => {
  const creatorApps = await db.appMembership.findMany({
    where: {
      userId,
      role: 'owner',
    },
    select: {
      echoAppId: true,
    },
  });

  // Get all transactions for the time period
  // For cumulative view, fetch from the beginning of time to get true cumulative data
  const transactions = await db.transaction.findMany({
    where: {
      echoAppId: {
        in: creatorApps.map(app => app.echoAppId),
      },
      createdAt: {
        gte: isCumulative ? new Date(0) : startDate, // Fetch from beginning of time for cumulative
        lte: endDate,
      },
      isArchived: false,
    },
    select: {
      rawTransactionCost: true,
      transactionMetadata: true,
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

  if (isCumulative) {
    // For cumulative view, calculate cumulative totals up to each bucket timestamp
    let cumulativeCost = 0;
    let cumulativeProfit = 0;
    let cumulativeTokens = 0;
    let cumulativeInputTokens = 0;
    let cumulativeOutputTokens = 0;
    let cumulativeTransactionCount = 0;

    // Sort transactions by creation date
    const sortedTransactions = transactions.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    let transactionIndex = 0;

    for (let i = 0; i < numBuckets; i++) {
      const bucketEnd = new Date(startDate.getTime() + (i + 1) * bucketSizeMs);

      // Add all transactions up to this bucket's end time
      while (
        transactionIndex < sortedTransactions.length &&
        sortedTransactions[transactionIndex].createdAt <= bucketEnd
      ) {
        const transaction = sortedTransactions[transactionIndex];
        cumulativeCost += Number(transaction.rawTransactionCost);
        cumulativeProfit += Number(transaction.markUpProfit);
        cumulativeTransactionCount += 1;

        // Extract token information from transactionMetadata
        if (transaction.transactionMetadata) {
          const metadata = transaction.transactionMetadata;
          if (metadata.totalTokens) {
            cumulativeTokens += Number(metadata.totalTokens);
          }
          if (metadata.inputTokens) {
            cumulativeInputTokens += Number(metadata.inputTokens);
          }
          if (metadata.outputTokens) {
            cumulativeOutputTokens += Number(metadata.outputTokens);
          }
        }
        transactionIndex++;
      }

      // Set cumulative values for this bucket
      buckets[i].totalCost = cumulativeCost;
      buckets[i].totalProfit = cumulativeProfit;
      buckets[i].totalTokens = cumulativeTokens;
      buckets[i].totalInputTokens = cumulativeInputTokens;
      buckets[i].totalOutputTokens = cumulativeOutputTokens;
      buckets[i].transactionCount = cumulativeTransactionCount;
    }
  } else {
    // For non-cumulative view, group transactions into buckets as before
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
  }

  return buckets;
};
