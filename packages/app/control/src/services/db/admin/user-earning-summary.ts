import { db } from '@/services/db/client';
import type { OverviewMetricConfig } from './type/overview-metric';
import { percentChange } from './util/percent-change';

type EarningsOverviewRow = {
  totalRevenue: number;
  totalAppProfit: number;
  totalMarkupProfit: number;
  totalReferralProfit: number;
  totalCompletedPayouts: number;
  earningUsers: number;
};

type EarningsTrendRow = {
  revenue_current: number;
  revenue_prev: number;
  app_profit_current: number;
  app_profit_prev: number;
  markup_profit_current: number;
  markup_profit_prev: number;
  referral_profit_current: number;
  referral_profit_prev: number;
  payouts_current: number;
  payouts_prev: number;
  earning_users_current: number;
  earning_users_prev: number;
};

export async function getUserEarningsOverviewMetrics(): Promise<
  OverviewMetricConfig[]
> {
  const summaryQuery = `
    WITH t AS (
      SELECT 
        COALESCE(SUM(t."totalCost"), 0)::double precision AS total_revenue,
        COALESCE(SUM(t."appProfit"), 0)::double precision AS total_app_profit,
        COALESCE(SUM(t."markUpProfit"), 0)::double precision AS total_markup_profit,
        COALESCE(SUM(t."referralProfit"), 0)::double precision AS total_referral_profit,
        0 AS earning_users -- placeholder; real value in eu CTE
      FROM "transactions" t
    ), p AS (
      SELECT COALESCE(SUM(p."amount") FILTER (WHERE p."status" = 'COMPLETED'::"EnumPayoutStatus"), 0)::double precision AS total_completed_payouts
      FROM "payouts" p
    ), eu AS (
      SELECT COUNT(DISTINCT am."userId") AS earning_users
      FROM "app_memberships" am
      JOIN "transactions" t2 ON t2."echoAppId" = am."echoAppId"
      WHERE am.role = 'owner'
    )
    SELECT 
      t.total_revenue AS "totalRevenue",
      t.total_app_profit AS "totalAppProfit",
      t.total_markup_profit AS "totalMarkupProfit",
      t.total_referral_profit AS "totalReferralProfit",
      p.total_completed_payouts AS "totalCompletedPayouts",
      eu.earning_users AS "earningUsers"
    FROM t, p, eu;
  `;

  const summary = await db.$queryRawUnsafe<EarningsOverviewRow[]>(summaryQuery);
  const s = summary[0] ?? {
    totalRevenue: 0,
    totalAppProfit: 0,
    totalMarkupProfit: 0,
    totalReferralProfit: 0,
    totalCompletedPayouts: 0,
    earningUsers: 0,
  };

  const trendQuery = `
    WITH ranges AS (
      SELECT 
        (NOW()::date - INTERVAL '7 days') AS start_current,
        NOW()::date AS end_current,
        (NOW()::date - INTERVAL '14 days') AS start_prev,
        (NOW()::date - INTERVAL '7 days') AS end_prev
    ),
    txn AS (
      SELECT 
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_current AND t."createdAt" < r.end_current THEN t."totalCost" END), 0)::double precision AS revenue_current,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_prev AND t."createdAt" < r.end_prev THEN t."totalCost" END), 0)::double precision AS revenue_prev,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_current AND t."createdAt" < r.end_current THEN t."appProfit" END), 0)::double precision AS app_profit_current,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_prev AND t."createdAt" < r.end_prev THEN t."appProfit" END), 0)::double precision AS app_profit_prev,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_current AND t."createdAt" < r.end_current THEN t."markUpProfit" END), 0)::double precision AS markup_profit_current,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_prev AND t."createdAt" < r.end_prev THEN t."markUpProfit" END), 0)::double precision AS markup_profit_prev,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_current AND t."createdAt" < r.end_current THEN t."referralProfit" END), 0)::double precision AS referral_profit_current,
        COALESCE(SUM(CASE WHEN t."createdAt" >= r.start_prev AND t."createdAt" < r.end_prev THEN t."referralProfit" END), 0)::double precision AS referral_profit_prev
      FROM "transactions" t, ranges r
    ),
    payouts AS (
      SELECT 
        COALESCE(SUM(CASE WHEN p."status" = 'COMPLETED'::"EnumPayoutStatus" AND p."createdAt" >= r.start_current AND p."createdAt" < r.end_current THEN p."amount" END), 0)::double precision AS payouts_current,
        COALESCE(SUM(CASE WHEN p."status" = 'COMPLETED'::"EnumPayoutStatus" AND p."createdAt" >= r.start_prev AND p."createdAt" < r.end_prev THEN p."amount" END), 0)::double precision AS payouts_prev
      FROM "payouts" p, ranges r
    ),
    earning_users AS (
      SELECT 
        COALESCE(COUNT(DISTINCT CASE WHEN t."createdAt" >= r.start_current AND t."createdAt" < r.end_current THEN am."userId" END), 0)::double precision AS earning_users_current,
        COALESCE(COUNT(DISTINCT CASE WHEN t."createdAt" >= r.start_prev AND t."createdAt" < r.end_prev THEN am."userId" END), 0)::double precision AS earning_users_prev
      FROM "transactions" t
      JOIN "app_memberships" am ON am."echoAppId" = t."echoAppId" AND am.role = 'owner',
      ranges r
    )
    SELECT 
      txn.revenue_current,
      txn.revenue_prev,
      txn.app_profit_current,
      txn.app_profit_prev,
      txn.markup_profit_current,
      txn.markup_profit_prev,
      txn.referral_profit_current,
      txn.referral_profit_prev,
      payouts.payouts_current,
      payouts.payouts_prev,
      earning_users.earning_users_current,
      earning_users.earning_users_prev
    FROM txn, payouts, earning_users;
  `;

  const trendRows = await db.$queryRawUnsafe<EarningsTrendRow[]>(trendQuery);
  const t = trendRows[0] ?? {
    revenue_current: 0,
    revenue_prev: 0,
    app_profit_current: 0,
    app_profit_prev: 0,
    markup_profit_current: 0,
    markup_profit_prev: 0,
    referral_profit_current: 0,
    referral_profit_prev: 0,
    payouts_current: 0,
    payouts_prev: 0,
    earning_users_current: 0,
    earning_users_prev: 0,
  };

  const trendLabel = 'vs previous 7d';

  const metrics: OverviewMetricConfig[] = [
    {
      id: 'totalRevenue',
      title: 'Total Revenue',
      description: 'Total revenue generated by users',
      displayType: 'currency',
      value: s.totalRevenue,
      trendValue: percentChange(t.revenue_current, t.revenue_prev),
      size: 'md',
      format: { showTrend: true, decimals: 2, trendLabel },
    },
    {
      id: 'totalAppProfit',
      title: 'App Profit',
      description: 'Total profit from app usage',
      displayType: 'currency',
      value: s.totalAppProfit,
      trendValue: percentChange(t.app_profit_current, t.app_profit_prev),
      size: 'md',
      format: { showTrend: true, decimals: 2, trendLabel },
    },
    {
      id: 'totalMarkupProfit',
      title: 'Markup Profit',
      description: 'Profit from markup fees',
      displayType: 'currency',
      value: s.totalMarkupProfit,
      trendValue: percentChange(t.markup_profit_current, t.markup_profit_prev),
      size: 'md',
      format: { showTrend: true, decimals: 2, trendLabel },
    },
    {
      id: 'totalReferralProfit',
      title: 'Referral Profit',
      description: 'Profit from referrals',
      displayType: 'currency',
      value: s.totalReferralProfit,
      trendValue: percentChange(
        t.referral_profit_current,
        t.referral_profit_prev
      ),
      size: 'md',
      format: { showTrend: true, decimals: 2, trendLabel },
    },
    {
      id: 'totalCompletedPayouts',
      title: 'Completed Payouts',
      description: 'Total amount paid out to users',
      displayType: 'currency',
      value: s.totalCompletedPayouts,
      trendValue: percentChange(t.payouts_current, t.payouts_prev),
      size: 'md',
      format: { showTrend: true, decimals: 2, trendLabel },
    },
    {
      id: 'earningUsers',
      title: 'Earning Users',
      description:
        'Distinct owners with at least one app that has a transaction',
      displayType: 'number',
      value: s.earningUsers,
      trendValue: percentChange(t.earning_users_current, t.earning_users_prev),
      size: 'sm',
      format: { showTrend: true, trendLabel },
    },
  ];

  return metrics;
}
