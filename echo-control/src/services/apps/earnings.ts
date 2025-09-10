import { db } from '@/lib/db';
import z from 'zod';

export const appEarningsSchema = z.object({
  appId: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const getAppEarnings = async ({
  appId,
  startDate,
  endDate,
}: z.infer<typeof appEarningsSchema>) => {
  const earnings = await db.transaction.aggregate({
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
    _sum: {
      markUpProfit: true,
    },
  });

  return Number(earnings._sum.markUpProfit);
};
