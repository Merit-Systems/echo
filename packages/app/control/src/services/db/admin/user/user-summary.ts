/**
 * User Summary Service - Provides high-level overview statistics for a single user
 * Combines earnings, spending, and app data into summary metrics for OverviewPanel
 */

import { db } from '@/services/db/client';
import type { OverviewMetricConfig } from '../type/overview-metric';
import { percentChange } from '../util/percent-change';

interface UserSummaryData {
  // User basic info
  userId: string;
  userName: string | null;
  userEmail: string;
  userCreatedAt: Date;

  // Earnings summary
  totalRevenue: number;
  totalAppProfit: number;
  totalMarkupProfit: number;
  totalReferralProfit: number;
  totalCompletedPayouts: number;

  // Spending summary
  totalSpent: number;
  totalPaid: number;
  balance: number;
  freeTierUsage: number;

  // App statistics
  totalApps: number;
  totalUsers: number;
  totalTransactions: number;
  totalTokens: number;

  // Activity metrics
  referralCodesGenerated: number;
  referredUsersCount: number;
  lastTransactionAt: Date | null;
}

interface TrendData {
  revenue_current: number;
  revenue_prev: number;
  app_profit_current: number;
  app_profit_prev: number;
  markup_profit_current: number;
  markup_profit_prev: number;
  tx_count_current: number;
  tx_count_prev: number;
  tokens_current: number;
  tokens_prev: number;
  payouts_current: number;
  payouts_prev: number;
  referred_current: number;
  referred_prev: number;
}

// Lightweight summary strictly for overview metrics to avoid fetching unnecessary data
type UserOverviewSummary = Pick<
  UserSummaryData,
  | 'totalRevenue'
  | 'totalAppProfit'
  | 'totalMarkupProfit'
  | 'freeTierUsage'
  | 'totalCompletedPayouts'
  | 'totalApps'
  | 'totalUsers'
  | 'totalTransactions'
  | 'totalTokens'
  | 'referredUsersCount'
>;

async function getUserOverviewSummary(
  userId: string
): Promise<UserOverviewSummary> {
  const query = `
    WITH user_earnings AS (
      SELECT 
        u.id,
        COALESCE(t_agg."totalRevenue", 0) AS "totalRevenue",
        COALESCE(t_agg."totalAppProfit", 0) AS "totalAppProfit",
        COALESCE(t_agg."totalMarkupProfit", 0) AS "totalMarkupProfit",
        COALESCE(p_agg."totalCompletedPayouts", 0) AS "totalCompletedPayouts"
      FROM "users" u
      LEFT JOIN LATERAL (
        SELECT 
          COALESCE(SUM(t."totalCost"), 0) AS "totalRevenue",
          COALESCE(SUM(t."appProfit"), 0) AS "totalAppProfit",
          COALESCE(SUM(t."markUpProfit"), 0) AS "totalMarkupProfit"
        FROM "transactions" t
        WHERE t."userId" = u.id
      ) t_agg ON TRUE
      LEFT JOIN LATERAL (
        SELECT 
          COALESCE(SUM(p."amount"), 0) AS "totalCompletedPayouts"
        FROM "payouts" p
        WHERE p."userId" = u.id AND p."status" = 'COMPLETED'::"EnumPayoutStatus"
      ) p_agg ON TRUE
      WHERE u.id = $1::uuid
    ),
    user_free_tier AS (
      SELECT 
        u.id,
        COALESCE(SUM(uspu."totalSpent"), 0) AS "freeTierUsage"
      FROM "users" u
      LEFT JOIN "user_spend_pool_usage" uspu ON u.id = uspu."userId"
      WHERE u.id = $1::uuid
      GROUP BY u.id
    ),
    user_apps AS (
      SELECT 
        owner_apps."userId",
        COUNT(*) as "totalApps",
        COALESCE(SUM(app_user_counts."totalUsers"), 0) as "totalUsers",
        COALESCE(SUM(app_tx."totalTransactions"), 0) as "totalTransactions",
        COALESCE(SUM(app_tx."totalTokens"), 0) as "totalTokens",
        MAX(app_tx."lastTransactionAt") as "lastTransactionAt"
      FROM (
        SELECT am."userId", a.id as app_id
        FROM "app_memberships" am
        INNER JOIN "echo_apps" a ON am."echoAppId" = a.id
        WHERE am."userId" = $1::uuid AND am.role = 'owner'
      ) owner_apps
      LEFT JOIN LATERAL (
        SELECT COUNT(DISTINCT am2."userId") as "totalUsers"
        FROM "app_memberships" am2
        WHERE am2."echoAppId" = owner_apps.app_id
      ) app_user_counts ON TRUE
      LEFT JOIN LATERAL (
        SELECT 
          COUNT(t.id) as "totalTransactions",
          COALESCE(SUM(tm."inputTokens" + tm."outputTokens"), 0) as "totalTokens",
          MAX(t."createdAt") as "lastTransactionAt"
        FROM "transactions" t
        LEFT JOIN "transaction_metadata" tm ON t."transactionMetadataId" = tm.id
        WHERE t."echoAppId" = owner_apps.app_id
      ) app_tx ON TRUE
      GROUP BY owner_apps."userId"
    ),
    user_referrals AS (
      SELECT 
        u.id,
        COUNT(DISTINCT am_referred.id) AS "referredUsersCount"
      FROM "users" u
      LEFT JOIN "referral_codes" rc ON u.id = rc."userId"
      LEFT JOIN "app_memberships" am_referred ON rc.id = am_referred."referrerId"
      WHERE u.id = $1::uuid
      GROUP BY u.id
    )
    SELECT 
      ue."totalRevenue",
      ue."totalAppProfit",
      ue."totalMarkupProfit",
      ue."totalCompletedPayouts",
      COALESCE(uf."freeTierUsage", 0) AS "freeTierUsage",
      COALESCE(ua."totalApps", 0) AS "totalApps",
      COALESCE(ua."totalUsers", 0) AS "totalUsers",
      COALESCE(ua."totalTransactions", 0) AS "totalTransactions",
      COALESCE(ua."totalTokens", 0) AS "totalTokens",
      COALESCE(ur."referredUsersCount", 0) AS "referredUsersCount"
    FROM user_earnings ue
    LEFT JOIN user_free_tier uf ON ue.id = uf.id
    LEFT JOIN user_apps ua ON ue.id = ua."userId"
    LEFT JOIN user_referrals ur ON ue.id = ur.id
  `;

  const result = await db.$queryRawUnsafe<Record<string, unknown>[]>(
    query,
    userId
  );
  if (result.length === 0) {
    return {
      totalRevenue: 0,
      totalAppProfit: 0,
      totalMarkupProfit: 0,
      freeTierUsage: 0,
      totalCompletedPayouts: 0,
      totalApps: 0,
      totalUsers: 0,
      totalTransactions: 0,
      totalTokens: 0,
      referredUsersCount: 0,
    };
  }
  const row = result[0];
  return {
    totalRevenue: Number(row.totalRevenue) || 0,
    totalAppProfit: Number(row.totalAppProfit) || 0,
    totalMarkupProfit: Number(row.totalMarkupProfit) || 0,
    freeTierUsage: Number(row.freeTierUsage) || 0,
    totalCompletedPayouts: Number(row.totalCompletedPayouts) || 0,
    totalApps: Number(row.totalApps) || 0,
    totalUsers: Number(row.totalUsers) || 0,
    totalTransactions: Number(row.totalTransactions) || 0,
    totalTokens: Number(row.totalTokens) || 0,
    referredUsersCount: Number(row.referredUsersCount) || 0,
  };
}

export const getUserOverviewMetrics = async (
  userId: string
): Promise<OverviewMetricConfig[]> => {
  // Use lightweight summary to avoid fetching unnecessary fields
  const summary = await getUserOverviewSummary(userId);

  // Compute last 7 days vs previous 7 days windows for key flow metrics
  const trendQuery = `
    WITH ranges AS (
      SELECT 
        (NOW()::date - INTERVAL '7 days') AS start_current,
        NOW()::date AS end_current,
        (NOW()::date - INTERVAL '14 days') AS start_prev,
        (NOW()::date - INTERVAL '7 days') AS end_prev
    ),
    txn_user AS (
      SELECT 
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_current AND t."createdAt" < r.end_current THEN t."totalCost" END), 0)::double precision AS revenue_current,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_prev AND t."createdAt" < r.end_prev THEN t."totalCost" END), 0)::double precision AS revenue_prev,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_current AND t."createdAt" < r.end_current THEN t."appProfit" END), 0)::double precision AS app_profit_current,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_prev AND t."createdAt" < r.end_prev THEN t."appProfit" END), 0)::double precision AS app_profit_prev,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_current AND t."createdAt" < r.end_current THEN t."markUpProfit" END), 0)::double precision AS markup_profit_current,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_prev AND t."createdAt" < r.end_prev THEN t."markUpProfit" END), 0)::double precision AS markup_profit_prev,
        COALESCE(COUNT(CASE WHEN t."createdAt" >= r.start_current AND t."createdAt" < r.end_current THEN 1 END), 0)::double precision AS tx_count_current,
        COALESCE(COUNT(CASE WHEN t."createdAt" >= r.start_prev AND t."createdAt" < r.end_prev THEN 1 END), 0)::double precision AS tx_count_prev,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_current AND t."createdAt" < r.end_current THEN (tm."inputTokens" + tm."outputTokens") END), 0)::double precision AS tokens_current,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_prev AND t."createdAt" < r.end_prev THEN (tm."inputTokens" + tm."outputTokens") END), 0)::double precision AS tokens_prev
      FROM "transactions" t
      LEFT JOIN "transaction_metadata" tm ON t."transactionMetadataId" = tm.id,
      ranges r
      WHERE t."userId" = $1::uuid
    ),
    payouts_user AS (
      SELECT 
        COALESCE(SUM(CASE WHEN p."status" = 'COMPLETED'::"EnumPayoutStatus" AND p."createdAt" >= r.start_current AND p."createdAt" < r.end_current THEN p."amount" END), 0)::double precision AS payouts_current,
        COALESCE(SUM(CASE WHEN p."status" = 'COMPLETED'::"EnumPayoutStatus" AND p."createdAt" >= r.start_prev AND p."createdAt" < r.end_prev THEN p."amount" END), 0)::double precision AS payouts_prev
      FROM "payouts" p, ranges r
      WHERE p."userId" = $1::uuid
    ),
    referrals_user AS (
      SELECT 
        COALESCE(COUNT(CASE WHEN am."createdAt" >= r.start_current AND am."createdAt" < r.end_current THEN 1 END), 0)::double precision AS referred_current,
        COALESCE(COUNT(CASE WHEN am."createdAt" >= r.start_prev AND am."createdAt" < r.end_prev THEN 1 END), 0)::double precision AS referred_prev
      FROM "app_memberships" am
      JOIN "referral_codes" rc ON am."referrerId" = rc.id
      JOIN ranges r ON TRUE
      WHERE rc."userId" = $1::uuid
    )
    SELECT 
      tu.revenue_current, tu.revenue_prev,
      tu.app_profit_current, tu.app_profit_prev,
      tu.markup_profit_current, tu.markup_profit_prev,
      tu.tx_count_current, tu.tx_count_prev,
      tu.tokens_current, tu.tokens_prev,
      pu.payouts_current, pu.payouts_prev,
      ru.referred_current, ru.referred_prev
    FROM txn_user tu, payouts_user pu, referrals_user ru;
  `;

  const trend = await db.$queryRawUnsafe<TrendData[]>(trendQuery, userId);

  const defaultTrend: TrendData = {
    revenue_current: 0,
    revenue_prev: 0,
    app_profit_current: 0,
    app_profit_prev: 0,
    markup_profit_current: 0,
    markup_profit_prev: 0,
    tx_count_current: 0,
    tx_count_prev: 0,
    tokens_current: 0,
    tokens_prev: 0,
    payouts_current: 0,
    payouts_prev: 0,
    referred_current: 0,
    referred_prev: 0,
  };

  const t = trend.length > 0 ? trend[0] : defaultTrend;

  const trendLabel = 'vs previous 7d';

  const metrics: OverviewMetricConfig[] = [
    {
      id: 'totalRevenue',
      title: 'Total Revenue',
      description: 'Total revenue generated across all apps',
      displayType: 'currency',
      value: summary.totalRevenue,
      trendValue: percentChange(t.revenue_current, t.revenue_prev),
      size: 'md',
      format: { showTrend: true, decimals: 2, trendLabel },
    },
    {
      id: 'totalAppProfit',
      title: 'App Profit',
      description: 'Profit from app usage',
      displayType: 'currency',
      value: summary.totalAppProfit,
      trendValue: percentChange(t.app_profit_current, t.app_profit_prev),
      size: 'md',
      format: { showTrend: true, decimals: 2, trendLabel },
    },
    {
      id: 'totalMarkupProfit',
      title: 'Markup Profit',
      description: 'Profit from markup fees',
      displayType: 'currency',
      value: summary.totalMarkupProfit,
      trendValue: percentChange(t.markup_profit_current, t.markup_profit_prev),
      size: 'md',
      format: { showTrend: true, decimals: 2, trendLabel },
    },
    {
      id: 'freeTierUsage',
      title: 'Free Tier Usage',
      description: 'Amount used from free tier',
      displayType: 'currency',
      value: summary.freeTierUsage,
      trendValue: 0,
      size: 'md',
      format: { showTrend: true, decimals: 2, trendLabel },
    },
    {
      id: 'totalCompletedPayouts',
      title: 'Completed Payouts',
      description: 'Total payouts received',
      displayType: 'currency',
      value: summary.totalCompletedPayouts,
      trendValue: percentChange(t.payouts_current, t.payouts_prev),
      size: 'md',
      format: { showTrend: true, decimals: 2, trendLabel },
    },
    {
      id: 'totalApps',
      title: 'Total Apps',
      description: 'Number of apps owned',
      displayType: 'number',
      value: summary.totalApps,
      trendValue: 0,
      size: 'sm',
      format: { showTrend: true, trendLabel },
    },
    {
      id: 'totalUsers',
      title: 'Total Users',
      description: 'Users across all apps',
      displayType: 'number',
      value: summary.totalUsers,
      trendValue: 0,
      size: 'sm',
      format: { showTrend: true, trendLabel },
    },
    {
      id: 'totalTransactions',
      title: 'Transactions',
      description: 'Transactions across all apps',
      displayType: 'number',
      value: summary.totalTransactions,
      trendValue: percentChange(t.tx_count_current, t.tx_count_prev),
      size: 'sm',
      format: { showTrend: true, trendLabel },
    },
    {
      id: 'totalTokens',
      title: 'Total Tokens',
      description: 'Tokens processed across all apps',
      displayType: 'number',
      value: summary.totalTokens,
      trendValue: percentChange(t.tokens_current, t.tokens_prev),
      size: 'sm',
      format: { showTrend: true, trendLabel },
    },
  ];

  return metrics;
};
