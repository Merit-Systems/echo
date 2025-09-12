import z from 'zod';

import { db } from '@/lib/db';
import {
  type PaginationParams,
  toPaginatedReponse,
} from '@/services/lib/pagination';
import { Prisma } from '@/generated/prisma';

export const appUsersSchema = z.object({
  appId: z.uuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  spendPoolId: z.uuid().optional(),
});

export const listAppUsers = async (
  { appId, startDate, endDate, spendPoolId }: z.infer<typeof appUsersSchema>,
  { page, page_size }: PaginationParams
) => {
  const where: Prisma.TransactionWhereInput = {
    echoAppId: appId,
    isArchived: false,
    ...((startDate || endDate) && {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }),
    ...(spendPoolId && {
      spendPoolId: spendPoolId,
    }),
  };

  const [count, users] = await Promise.all([
    countAppUsersInternal(where),
    (async () => {
      const topUsersWithStats = await db.transaction.groupBy({
        by: ['userId'],
        where: where,
        _sum: {
          totalCost: true,
          rawTransactionCost: true,
          markUpProfit: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            totalCost: 'desc',
          },
        },
        skip: page * page_size,
        take: page_size,
      });

      // Get user details and membership info for the top users
      const userIds = topUsersWithStats.map(stat => stat.userId);

      const usersWithDetails = await db.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      // Combine the data
      const users = topUsersWithStats.map(stat => {
        const user = usersWithDetails.find(u => u.id === stat.userId);

        if (!user) {
          return null;
        }

        return {
          ...user,
          usage: {
            totalTransactions: stat._count.id,
            totalCost: Number(stat._sum.totalCost ?? 0),
            rawCost: Number(stat._sum.rawTransactionCost ?? 0),
            markupProfit: Number(stat._sum.markUpProfit ?? 0),
          },
        };
      });

      return users.filter(Boolean) as NonNullable<(typeof users)[number]>[];
    })(),
  ]);

  return toPaginatedReponse({
    items: users,
    total_count: count,
    page,
    page_size,
  });
};

export const countAppUsers = async ({
  appId,
  startDate,
  endDate,
}: z.infer<typeof appUsersSchema>) => {
  return await countAppUsersInternal({
    echoAppId: appId,
    isArchived: false,
    ...((startDate || endDate) && {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }),
  });
};

const countAppUsersInternal = async (where: Prisma.TransactionWhereInput) => {
  return await db.transaction
    .groupBy({
      by: ['userId'],
      where: where,
      _count: {
        userId: true,
      },
    })
    .then(groups => groups.length);
};
