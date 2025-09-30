import type { ChartItem } from '@/services/db/admin/type/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { db } from '@/services/db/client';

interface GetHomePageChartInput {
  startDate?: Date;
  endDate?: Date;
  numBuckets?: number; // default 30 (daily buckets over last 30 days)
  isCumulative?: boolean;
}

/**
 * Updates chart descriptions for cumulative mode
 */
function updateChartDescription(
  description: string,
  isCumulative: boolean
): string {
  if (!isCumulative) return description;

  // Replace common patterns with cumulative equivalents
  return description
    .replace(/per day/g, 'cumulative')
    .replace(/per\s+\w+/g, 'cumulative')
    .replace(/generated per day/g, 'total generated')
    .replace(/created per day/g, 'total created')
    .replace(/\(last \d+ days\)/g, '(cumulative over time)');
}

export const getHomePageChart = async (
  input?: GetHomePageChartInput
): Promise<ChartItem[]> => {
  const startOfUtcDay = (d: Date) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

  const defaultEndExclusive = new Date(
    startOfUtcDay(new Date()).getTime() + 24 * 60 * 60 * 1000
  );

  const endDate = input?.endDate ?? defaultEndExclusive;
  const startDate =
    input?.startDate ??
    new Date(
      (input?.endDate
        ? startOfUtcDay(input.endDate)
        : defaultEndExclusive
      ).getTime() -
        30 * 24 * 60 * 60 * 1000
    );
  const numBuckets = input?.numBuckets ?? 30;
  const isCumulative = input?.isCumulative ?? false;

  // For non-cumulative mode, we need to fetch data in the date range for bucketing
  // For cumulative mode, we'll query directly per bucket
  let transactions: {
    createdAt: Date;
    transactionMetadata: { totalTokens: number | null } | null;
  }[] = [];
  let users: { createdAt: Date }[] = [];
  let apps: { createdAt: Date }[] = [];
  let refreshTokens: { createdAt: Date }[] = [];

  if (!isCumulative) {
    [transactions, users, apps, refreshTokens] = await db.$transaction([
      db.transaction.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          isArchived: false,
        },
        select: {
          createdAt: true,
          transactionMetadata: {
            select: {
              totalTokens: true,
            },
          },
        },
      }),
      db.user.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          isArchived: false,
        },
        select: { createdAt: true },
      }),
      db.echoApp.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          isArchived: false,
        },
        select: { createdAt: true },
      }),
      db.refreshToken.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          isArchived: false,
        },
        select: { createdAt: true },
      }),
    ]);
  }

  const totalMs = endDate.getTime() - startDate.getTime();
  const bucketSizeMs = Math.max(1, Math.floor(totalMs / numBuckets));

  const makeBuckets = () =>
    Array.from({ length: numBuckets }, (_, i) => {
      const bucketStart = new Date(startDate.getTime() + i * bucketSizeMs);
      return { timestamp: bucketStart } as { timestamp: Date } & Record<
        string,
        number
      >;
    });

  // Tokens per bucket
  let tokensData: Array<{ timestamp: string; tokens: number }>;

  if (isCumulative) {
    // For cumulative, get total tokens from beginning of time up to each bucket
    const tokenBuckets = makeBuckets();
    const tokensDataPromises = tokenBuckets.map(async bucket => {
      const transactions = await db.transaction.findMany({
        where: {
          createdAt: {
            lte: new Date(bucket.timestamp.getTime() + bucketSizeMs),
          },
          isArchived: false,
        },
        select: {
          transactionMetadata: {
            select: {
              totalTokens: true,
            },
          },
        },
      });

      const totalTokens = transactions.reduce((sum, t) => {
        return sum + Number(t.transactionMetadata?.totalTokens ?? 0);
      }, 0);

      return {
        timestamp: bucket.timestamp.toISOString().slice(0, 16),
        tokens: totalTokens,
      };
    });

    tokensData = await Promise.all(tokensDataPromises);
  } else {
    // For non-cumulative, use the existing bucketing logic
    const tokenBuckets = makeBuckets().map(b => ({ ...b, tokens: 0 }));
    for (const t of transactions) {
      const idx = Math.floor(
        (t.createdAt.getTime() - startDate.getTime()) / bucketSizeMs
      );
      if (idx >= 0 && idx < numBuckets) {
        const amt = Number(t.transactionMetadata?.totalTokens ?? 0);
        tokenBuckets[idx].tokens += amt;
      }
    }
    tokensData = tokenBuckets.map(b => ({
      timestamp: b.timestamp.toISOString().slice(0, 16),
      tokens: Number(b.tokens || 0),
    }));
  }

  // User signups per bucket
  let signupsData: Array<{ timestamp: string; signups: number }>;

  if (isCumulative) {
    // For cumulative, get total users from beginning of time up to each bucket
    const signupBuckets = makeBuckets();
    const signupsDataPromises = signupBuckets.map(async bucket => {
      const totalUsers = await db.user.count({
        where: {
          createdAt: {
            lte: new Date(bucket.timestamp.getTime() + bucketSizeMs),
          },
          isArchived: false,
        },
      });

      return {
        timestamp: bucket.timestamp.toISOString().slice(0, 16),
        signups: totalUsers,
      };
    });

    signupsData = await Promise.all(signupsDataPromises);
  } else {
    // For non-cumulative, use the existing bucketing logic
    const signupBuckets = makeBuckets().map(b => ({ ...b, signups: 0 }));
    for (const u of users) {
      const idx = Math.floor(
        (u.createdAt.getTime() - startDate.getTime()) / bucketSizeMs
      );
      if (idx >= 0 && idx < numBuckets) {
        signupBuckets[idx].signups += 1;
      }
    }
    signupsData = signupBuckets.map(b => ({
      timestamp: b.timestamp.toISOString().slice(0, 16),
      signups: Number(b.signups || 0),
    }));
  }

  // App creations per bucket
  let appsData: Array<{ timestamp: string; apps: number }>;

  if (isCumulative) {
    // For cumulative, get total apps from beginning of time up to each bucket
    const appBuckets = makeBuckets();
    const appsDataPromises = appBuckets.map(async bucket => {
      const totalApps = await db.echoApp.count({
        where: {
          createdAt: {
            lte: new Date(bucket.timestamp.getTime() + bucketSizeMs),
          },
          isArchived: false,
        },
      });

      return {
        timestamp: bucket.timestamp.toISOString().slice(0, 16),
        apps: totalApps,
      };
    });

    appsData = await Promise.all(appsDataPromises);
  } else {
    // For non-cumulative, use the existing bucketing logic
    const appBuckets = makeBuckets().map(b => ({ ...b, apps: 0 }));
    for (const a of apps) {
      const idx = Math.floor(
        (a.createdAt.getTime() - startDate.getTime()) / bucketSizeMs
      );
      if (idx >= 0 && idx < numBuckets) {
        appBuckets[idx].apps += 1;
      }
    }
    appsData = appBuckets.map(b => ({
      timestamp: b.timestamp.toISOString().slice(0, 16),
      apps: Number(b.apps || 0),
    }));
  }

  // Refresh tokens created per bucket
  let refreshTokensData: Array<{ timestamp: string; refreshTokens: number }>;

  if (isCumulative) {
    // For cumulative, get total refresh tokens from beginning of time up to each bucket
    const rtBuckets = makeBuckets();
    const refreshTokensDataPromises = rtBuckets.map(async bucket => {
      const totalRefreshTokens = await db.refreshToken.count({
        where: {
          createdAt: {
            lte: new Date(bucket.timestamp.getTime() + bucketSizeMs),
          },
          isArchived: false,
        },
      });

      return {
        timestamp: bucket.timestamp.toISOString().slice(0, 16),
        refreshTokens: totalRefreshTokens,
      };
    });

    refreshTokensData = await Promise.all(refreshTokensDataPromises);
  } else {
    // For non-cumulative, use the existing bucketing logic
    const rtBuckets = makeBuckets().map(b => ({ ...b, refreshTokens: 0 }));
    for (const rt of refreshTokens) {
      const idx = Math.floor(
        (rt.createdAt.getTime() - startDate.getTime()) / bucketSizeMs
      );
      if (idx >= 0 && idx < numBuckets) {
        rtBuckets[idx].refreshTokens += 1;
      }
    }
    refreshTokensData = rtBuckets.map(b => ({
      timestamp: b.timestamp.toISOString().slice(0, 16),
      refreshTokens: Number(b.refreshTokens || 0),
    }));
  }

  // Chart configs
  const tokensConfig: ChartConfig = {
    tokens: { label: 'Tokens', color: '#7c3aed' },
  };
  const signupsConfig: ChartConfig = {
    signups: { label: 'User Signups', color: '#16a34a' },
  };
  const appsConfig: ChartConfig = {
    apps: { label: 'App Creations', color: '#f59e0b' },
  };
  const refreshTokensConfig: ChartConfig = {
    refreshTokens: { label: 'Refresh Tokens', color: '#2563eb' },
  };

  const charts: ChartItem[] = [
    {
      id: 'total-tokens-over-time',
      type: 'area-linear',
      title: isCumulative ? 'Total Tokens (Cumulative)' : 'Total Tokens',
      description: updateChartDescription(
        'Total tokens generated across all apps over the last 30 days',
        isCumulative
      ),
      props: {
        title: isCumulative ? 'Total Tokens (Cumulative)' : 'Total Tokens',
        description: updateChartDescription(
          'Tokens generated per day (last 30 days)',
          isCumulative
        ),
        data: tokensData,
        config: tokensConfig,
        xAxisDataKey: 'timestamp',
        areaDataKey: 'tokens',
      },
      size: 'md',
    },
    {
      id: 'user-signups-per-day',
      type: 'area-linear',
      title: isCumulative
        ? 'User Signups (Cumulative)'
        : 'User Signups per Day',
      description: updateChartDescription(
        'New users created over the last 30 days',
        isCumulative
      ),
      props: {
        title: isCumulative ? 'User Signups (Cumulative)' : 'User Signups',
        description: updateChartDescription(
          'New users per day (last 30 days)',
          isCumulative
        ),
        data: signupsData,
        config: signupsConfig,
        xAxisDataKey: 'timestamp',
        areaDataKey: 'signups',
      },
      size: 'md',
    },
    {
      id: 'app-creations-per-day',
      type: 'area-linear',
      title: isCumulative
        ? 'App Creations (Cumulative)'
        : 'App Creations per Day',
      description: updateChartDescription(
        'New apps created over the last 30 days',
        isCumulative
      ),
      props: {
        title: isCumulative ? 'App Creations (Cumulative)' : 'App Creations',
        description: updateChartDescription(
          'New apps per day (last 30 days)',
          isCumulative
        ),
        data: appsData,
        config: appsConfig,
        xAxisDataKey: 'timestamp',
        areaDataKey: 'apps',
      },
      size: 'md',
    },
    {
      id: 'refresh-tokens-created-per-day',
      type: 'area-linear',
      title: isCumulative
        ? 'Refresh Tokens (Cumulative)'
        : 'Refresh Tokens per Day',
      description: updateChartDescription(
        'Refresh tokens created over the last 30 days',
        isCumulative
      ),
      props: {
        title: isCumulative ? 'Refresh Tokens (Cumulative)' : 'Refresh Tokens',
        description: updateChartDescription(
          'Refresh tokens created per day (last 30 days)',
          isCumulative
        ),
        data: refreshTokensData,
        config: refreshTokensConfig,
        xAxisDataKey: 'timestamp',
        areaDataKey: 'refreshTokens',
      },
      size: 'md',
    },
  ];

  return charts;
};
