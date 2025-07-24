import { DbContext, getDbContext } from '../transaction-utils';

export async function getMarkupRevenueForApp(
  appId: string,
  tx?: DbContext
): Promise<number> {
  const dbContext = getDbContext(tx);
  const totalMarkupEarned = await dbContext.revenue.aggregate({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    _sum: {
      markupAmount: true,
    },
  });

  return Number(totalMarkupEarned._sum.markupAmount || 0);
}

/** Returns a map of appId: Total Revenue */
export async function getTotalRevenueForApps(
  appIds: string[],
  tx?: DbContext
): Promise<Map<string, number>> {
  // Get revenue totals for all apps in batch
  const dbContext = getDbContext(tx);
  const revenueStats = await dbContext.revenue.groupBy({
    by: ['echoAppId'],
    where: {
      echoAppId: { in: appIds },
      isArchived: false,
    },
    _sum: {
      amount: true,
    },
  });
  // Create a map for quick lookup of revenue stats
  const revenueMap = new Map(
    revenueStats.map(stat => [stat.echoAppId, Number(stat._sum.amount || 0)])
  );

  return revenueMap;
}

export async function getTotalRevenueForApp(
  appId: string,
  tx?: DbContext
): Promise<number> {
  const dbContext = getDbContext(tx);
  const totalRevenue = await dbContext.revenue.aggregate({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    _sum: {
      amount: true,
    },
  });

  return Number(totalRevenue._sum.amount || 0);
}

export async function getTotalRevenueForUserApp(
  appId: string,
  userId: string,
  tx?: DbContext
): Promise<number> {
  const dbContext = getDbContext(tx);
  const totalRevenue = await dbContext.revenue.aggregate({
    where: {
      echoAppId: appId,
      userId: userId,
      isArchived: false,
    },
    _sum: {
      amount: true,
    },
  });

  return Number(totalRevenue._sum.amount || 0);
}
