import type { ChartItem } from '@/services/db/admin/type/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { db } from '@/services/db/client';
import { queryRaw } from '@/services/db/_lib/query-raw';
import { Prisma } from '@/generated/prisma';
import { z } from 'zod';

interface GetHomePageChartInput {
  startDate?: Date;
  endDate?: Date;
  numBuckets?: number; // default 30 (daily buckets over last 30 days)
  isCumulative?: boolean;
}

// Zod schemas for raw query results
const cumulativeBucketSchema = z.object({
  timestamp: z.string(),
  value: z.bigint().transform(val => Number(val)),
});

const cumulativeResultSchema = z.array(cumulativeBucketSchema);

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

  // For non-cumulative mode, fetch data in the date range for bucketing
  // For cumulative mode, we use window functions in SQL queries
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

  // Declare data arrays
  let tokensData: Array<{ timestamp: string; tokens: number }>;
  let signupsData: Array<{ timestamp: string; signups: number }>;
  let appsData: Array<{ timestamp: string; apps: number }>;
  let refreshTokensData: Array<{ timestamp: string; refreshTokens: number }>;

  // For cumulative mode, run all queries in parallel for better performance
  if (isCumulative) {
    const bucketInterval = `${bucketSizeMs} milliseconds`;

    // Run all 4 cumulative queries in parallel
    const [tokensResult, signupsResult, appsResult, refreshTokensResult] =
      await Promise.all([
        // Tokens query
        queryRaw(
          Prisma.sql`
          WITH buckets AS (
            SELECT generate_series(
              ${startDate}::timestamp,
              ${endDate}::timestamp - interval '1 millisecond',
              ${bucketInterval}::interval
            ) AS bucket_time
          ),
          cumulative_tokens AS (
            SELECT 
              b.bucket_time,
              COALESCE(
                SUM(COALESCE(tm."totalTokens"::numeric, 0))
              , 0) AS cumulative_value
            FROM buckets b
            LEFT JOIN transactions t 
              ON t."createdAt" <= b.bucket_time 
              AND t."isArchived" = false
            LEFT JOIN transaction_metadata tm 
              ON t."transactionMetadataId" = tm.id
            GROUP BY b.bucket_time
            ORDER BY b.bucket_time
          )
          SELECT 
            to_char(bucket_time, 'YYYY-MM-DD"T"HH24:MI') as timestamp,
            cumulative_value::bigint as value
          FROM cumulative_tokens
        `,
          cumulativeResultSchema
        ),
        // User signups query
        queryRaw(
          Prisma.sql`
          WITH buckets AS (
            SELECT generate_series(
              ${startDate}::timestamp,
              ${endDate}::timestamp - interval '1 millisecond',
              ${bucketInterval}::interval
            ) AS bucket_time
          ),
          cumulative_users AS (
            SELECT 
              b.bucket_time,
              COUNT(u.id) AS cumulative_value
            FROM buckets b
            LEFT JOIN users u 
              ON u."createdAt" <= b.bucket_time 
              AND u."isArchived" = false
            GROUP BY b.bucket_time
            ORDER BY b.bucket_time
          )
          SELECT 
            to_char(bucket_time, 'YYYY-MM-DD"T"HH24:MI') as timestamp,
            cumulative_value::bigint as value
          FROM cumulative_users
        `,
          cumulativeResultSchema
        ),
        // Apps query
        queryRaw(
          Prisma.sql`
          WITH buckets AS (
            SELECT generate_series(
              ${startDate}::timestamp,
              ${endDate}::timestamp - interval '1 millisecond',
              ${bucketInterval}::interval
            ) AS bucket_time
          ),
          cumulative_apps AS (
            SELECT 
              b.bucket_time,
              COUNT(a.id) AS cumulative_value
            FROM buckets b
            LEFT JOIN echo_apps a 
              ON a."createdAt" <= b.bucket_time 
              AND a."isArchived" = false
            GROUP BY b.bucket_time
            ORDER BY b.bucket_time
          )
          SELECT 
            to_char(bucket_time, 'YYYY-MM-DD"T"HH24:MI') as timestamp,
            cumulative_value::bigint as value
          FROM cumulative_apps
        `,
          cumulativeResultSchema
        ),
        // Refresh tokens query
        queryRaw(
          Prisma.sql`
          WITH buckets AS (
            SELECT generate_series(
              ${startDate}::timestamp,
              ${endDate}::timestamp - interval '1 millisecond',
              ${bucketInterval}::interval
            ) AS bucket_time
          ),
          cumulative_refresh_tokens AS (
            SELECT 
              b.bucket_time,
              COUNT(rt.token) AS cumulative_value
            FROM buckets b
            LEFT JOIN refresh_tokens rt 
              ON rt."createdAt" <= b.bucket_time 
              AND rt."isArchived" = false
            GROUP BY b.bucket_time
            ORDER BY b.bucket_time
          )
          SELECT 
            to_char(bucket_time, 'YYYY-MM-DD"T"HH24:MI') as timestamp,
            cumulative_value::bigint as value
          FROM cumulative_refresh_tokens
        `,
          cumulativeResultSchema
        ),
      ]);

    tokensData = tokensResult.map(r => ({
      timestamp: r.timestamp,
      tokens: r.value,
    }));
    signupsData = signupsResult.map(r => ({
      timestamp: r.timestamp,
      signups: r.value,
    }));
    appsData = appsResult.map(r => ({
      timestamp: r.timestamp,
      apps: r.value,
    }));
    refreshTokensData = refreshTokensResult.map(r => ({
      timestamp: r.timestamp,
      refreshTokens: r.value,
    }));
  } else {
    // Non-cumulative mode - fetch and bucket data
    const tokenBuckets = makeBuckets().map(b => ({ ...b, tokens: 0 }));
    const signupBuckets = makeBuckets().map(b => ({ ...b, signups: 0 }));
    const appBuckets = makeBuckets().map(b => ({ ...b, apps: 0 }));
    const rtBuckets = makeBuckets().map(b => ({ ...b, refreshTokens: 0 }));

    // Bucket tokens
    for (const t of transactions) {
      const idx = Math.floor(
        (t.createdAt.getTime() - startDate.getTime()) / bucketSizeMs
      );
      if (idx >= 0 && idx < numBuckets) {
        const amt = Number(t.transactionMetadata?.totalTokens ?? 0);
        tokenBuckets[idx].tokens += amt;
      }
    }

    // Bucket users
    for (const u of users) {
      const idx = Math.floor(
        (u.createdAt.getTime() - startDate.getTime()) / bucketSizeMs
      );
      if (idx >= 0 && idx < numBuckets) {
        signupBuckets[idx].signups += 1;
      }
    }

    // Bucket apps
    for (const a of apps) {
      const idx = Math.floor(
        (a.createdAt.getTime() - startDate.getTime()) / bucketSizeMs
      );
      if (idx >= 0 && idx < numBuckets) {
        appBuckets[idx].apps += 1;
      }
    }

    // Bucket refresh tokens
    for (const rt of refreshTokens) {
      const idx = Math.floor(
        (rt.createdAt.getTime() - startDate.getTime()) / bucketSizeMs
      );
      if (idx >= 0 && idx < numBuckets) {
        rtBuckets[idx].refreshTokens += 1;
      }
    }

    tokensData = tokenBuckets.map(b => ({
      timestamp: b.timestamp.toISOString().slice(0, 16),
      tokens: Number(b.tokens || 0),
    }));
    signupsData = signupBuckets.map(b => ({
      timestamp: b.timestamp.toISOString().slice(0, 16),
      signups: Number(b.signups || 0),
    }));
    appsData = appBuckets.map(b => ({
      timestamp: b.timestamp.toISOString().slice(0, 16),
      apps: Number(b.apps || 0),
    }));
    refreshTokensData = rtBuckets.map(b => ({
      timestamp: b.timestamp.toISOString().slice(0, 16),
      refreshTokens: Number(b.refreshTokens || 0),
    }));
  }

  // Chart configs (moved outside the if/else for clarity)
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

  // Skip the individual metric sections below and jump to chart creation
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
