import { DbContext, getDbContext } from '@/lib/transaction-utils';
import { AppActivity } from '../types';

export const getAppActivityForApps = async (
  appIds: string[],
  lookbackDays: number = 7,
  userId?: string,
  tx?: DbContext
): Promise<Map<string, AppActivity[]>> => {
  const activityMap = new Map<string, AppActivity[]>();

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

  const dbContext = getDbContext(tx);
  const transactions = await dbContext.transaction.findMany({
    where: {
      echoAppId: { in: appIds },
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
      createdAt: true,
      inputTokens: true,
      outputTokens: true,
      totalTokens: true,
      cost: true,
    },
  });

  // Group transactions by appId and day
  for (const appId of appIds) {
    const appTransactions = transactions.filter(tx => tx.echoAppId === appId);

    const appActivity = days.map(dayStart => {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayTransactions = appTransactions.filter(
        tx => tx.createdAt >= dayStart && tx.createdAt < dayEnd
      );

      const totalCost = dayTransactions.reduce(
        (sum, tx) => sum + Number(tx.cost),
        0
      );
      const totalTokens = dayTransactions.reduce(
        (sum, tx) => sum + tx.totalTokens,
        0
      );
      const totalInputTokens = dayTransactions.reduce(
        (sum, tx) => sum + tx.inputTokens,
        0
      );
      const totalOutputTokens = dayTransactions.reduce(
        (sum, tx) => sum + tx.outputTokens,
        0
      );

      return {
        timestamp: dayStart,
        totalCost,
        totalTokens,
        totalInputTokens,
        totalOutputTokens,
      };
    });

    activityMap.set(appId, appActivity);
  }

  return activityMap;
};

export const getAppActivity = async (
  appId: string,
  lookbackDays: number = 7,
  userId?: string,
  tx?: DbContext
): Promise<AppActivity[]> => {
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

  const dbContext = getDbContext(tx);
  const transactions = await dbContext.transaction.findMany({
    where: {
      echoAppId: appId,
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
      isArchived: false,
      // Filter by user if provided
      ...(userId && { userId }),
    },
    select: {
      createdAt: true,
      inputTokens: true,
      outputTokens: true,
      totalTokens: true,
      cost: true,
    },
  });

  // Group transactions by day and calculate activity for each day
  return days.map(dayStart => {
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayTransactions = transactions.filter(
      tx => tx.createdAt >= dayStart && tx.createdAt < dayEnd
    );

    const totalCost = dayTransactions.reduce(
      (sum, tx) => sum + Number(tx.cost),
      0
    );
    const totalTokens = dayTransactions.reduce(
      (sum, tx) => sum + tx.totalTokens,
      0
    );
    const totalInputTokens = dayTransactions.reduce(
      (sum, tx) => sum + tx.inputTokens,
      0
    );
    const totalOutputTokens = dayTransactions.reduce(
      (sum, tx) => sum + tx.outputTokens,
      0
    );

    return {
      timestamp: dayStart,
      totalCost,
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
    };
  });
};

/**
 * Transform AppActivity array to the number[] format expected by UI components
 * where index equals position in array and count equals totalTokens
 */
export const transformActivityToChartData = (
  activity: AppActivity[]
): number[] => {
  return activity.map(day => day.totalTokens);
};

/**
 * Transform AppActivity array to chart data format expected by CommitChart component
 */
export const transformActivityData = (data: AppActivity[]) => {
  if (!data || data.length === 0) {
    return [];
  }

  return data.map((activity, index) => ({
    index,
    count: activity.totalTokens,
    date:
      typeof activity.timestamp === 'string'
        ? activity.timestamp
        : activity.timestamp.toISOString(),
  }));
};
