import z from 'zod';

import { format } from 'date-fns';

import { db } from '@/lib/db';

import {
  toPaginatedReponse,
  type PaginationParams,
} from '@/services/lib/pagination';

export const listAppTransactionsSchema = z.object({
  appId: z.uuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const listAppTransactions = async (
  { appId, startDate, endDate }: z.infer<typeof listAppTransactionsSchema>,
  { page, page_size }: PaginationParams
) => {
  // Run count and findMany in parallel using Promise.all
  const [count, transactions] = await Promise.all([
    db.transaction.count({
      where: {
        echoAppId: appId,
        isArchived: false,
        ...((startDate !== undefined || endDate !== undefined) && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
    }),
    db.transaction.findMany({
      where: {
        echoAppId: appId,
        isArchived: false,
        ...((startDate !== undefined || endDate !== undefined) && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: page * page_size,
      take: page_size,
    }),
  ]);

  // Group transactions by user, date, and model
  const groupedTransactions = new Map<
    string,
    {
      id: string;
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
      date: Date;
      callCount: number;
      markUpProfit: number;
    }
  >();

  for (const transaction of transactions) {
    const userKey = `${transaction.userId}-${format(transaction.createdAt, 'yyyy-MM-dd')}`;

    if (groupedTransactions.has(userKey)) {
      // Aggregate existing group
      const existing = groupedTransactions.get(userKey)!;
      existing.callCount += 1;
      existing.markUpProfit += Number(transaction.markUpProfit);
    } else {
      // Create new group
      groupedTransactions.set(userKey, {
        id: transaction.id,
        user: {
          id: transaction.userId,
          name: transaction.user.name,
          image: transaction.user.image,
        },
        callCount: 1,
        markUpProfit: Number(transaction.markUpProfit),
        date: transaction.createdAt,
      });
    }
  }

  // Convert to array and sort by date (newest first)
  const items = Array.from(groupedTransactions.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return toPaginatedReponse({
    items,
    total_count: count,
    page,
    page_size,
  });
};

export const countAppTransactionsSchema = z.object({
  appId: z.uuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const countAppTransactions = async ({
  appId,
  startDate,
  endDate,
}: z.infer<typeof countAppTransactionsSchema>) => {
  return await db.transaction.count({
    where: {
      echoAppId: appId,
      isArchived: false,
      ...((startDate !== undefined || endDate !== undefined) && {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    },
  });
};
