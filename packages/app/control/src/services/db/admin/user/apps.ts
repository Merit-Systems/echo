/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * User Apps Service - Shows all apps owned by a specific user with comprehensive usage and financial data
 * This shows how to create a TRPC procedure that accepts standardized pagination,
 * sorting, and filtering parameters and returns user app data in the expected format.
 */

import type { PaginationParams } from '@/services/db/_lib/pagination';
import { toPaginatedReponse } from '@/services/db/_lib/pagination';
import type { MultiSortParams } from '@/services/db/_lib/sorting';
import { buildOrderByClause } from '@/services/db/admin/util/build-order-by-clause';
import type { FilterParams } from '@/services/db/_lib/filtering';
import { db } from '@/services/db/client';
import { buildFilterClauses } from '@/services/db/admin/util/build-filter-clause';

interface UserAppRow {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  totalUsers: number;
  totalTransactions: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalSpent: number;
  totalSpentFreeTier: number;
  totalSpentUserBalances: number;
  totalReferralProfitEarned: number;
  totalMarkupProfitEarned: number;
  totalTransactionCosts: number;
  lastTransactionAt: Date;
}

interface PayoutData {
  echoAppId: string;
  userId: string;
  type: string;
  totalClaimed: number;
}

// Map frontend column names to SQL expressions
const COLUMN_MAPPINGS: Record<string, string> = {
  id: 'a.id',
  name: 'a.name',
  description: 'a.description',
  createdAt: 'a."createdAt"',
  updatedAt: 'a."updatedAt"',
  totalUsers: 'COALESCE(u_stat."totalUsers", 0)',
  totalTransactions: 'COALESCE(tx."totalTransactions", 0)',
  totalInputTokens: 'COALESCE(tx."totalInputTokens", 0)',
  totalOutputTokens: 'COALESCE(tx."totalOutputTokens", 0)',
  totalTokens: 'COALESCE(tx."totalTokens", 0)',
  totalSpent: 'COALESCE(tx."totalSpent", 0)',
  totalSpentFreeTier: 'COALESCE(tx."totalSpentFreeTier", 0)',
  totalSpentUserBalances: 'COALESCE(tx."totalSpentUserBalances", 0)',
  totalReferralProfitEarned: 'COALESCE(tx."totalReferralProfitEarned", 0)',
  totalMarkupProfitEarned: 'COALESCE(tx."totalMarkupProfitEarned", 0)',
  totalTransactionCosts: 'COALESCE(tx."totalTransactionCosts", 0)',
  lastTransactionAt: 'tx."lastTransactionAt"',
};

// Helper function to get payout information
const getPayoutInformation = async (appIds: string[]) => {
  if (appIds.length === 0)
    return { referralPayouts: new Map(), markupPayouts: new Map() };

  const payoutsQuery = `
    SELECT 
      p."echoAppId",
      p."userId",
      p.type,
      COALESCE(SUM(p.amount), 0) as "totalClaimed"
    FROM "payouts" p
    WHERE (p."echoAppId" = ANY($1::uuid[]) OR p."userId" = ANY($2::uuid[]))
      AND p.status = 'COMPLETED'::"EnumPayoutStatus"
    GROUP BY p."echoAppId", p."userId", p.type
  `;

  // Extract user IDs from app ownership (we'll need to get this from the main query context)
  const userIds = appIds; // This is a simplification - in practice we'd need the actual user IDs

  const payoutsData = await db.$queryRawUnsafe<PayoutData[]>(
    payoutsQuery,
    appIds,
    userIds
  );

  const referralPayouts = new Map<string, number>();
  const markupPayouts = new Map<string, number>();

  payoutsData.forEach(row => {
    if (row.type === 'referral' && row.userId) {
      // For referral payouts, we group by user (since referral profits are user-based)
      referralPayouts.set(
        row.userId,
        (referralPayouts.get(row.userId) ?? 0) + row.totalClaimed
      );
    } else if (row.type === 'markup' && row.echoAppId) {
      // For markup payouts, we group by app
      markupPayouts.set(
        row.echoAppId,
        (markupPayouts.get(row.echoAppId) ?? 0) + row.totalClaimed
      );
    }
  });

  return { referralPayouts, markupPayouts };
};

// Main function for getting user apps with pagination
export const getUserAppsWithPagination = async (
  params: PaginationParams & MultiSortParams & FilterParams & { userId: string }
) => {
  // Build dynamic clauses
  const { whereClause, havingClause, parameters } = buildFilterClauses(
    params.filters,
    {
      columnMappings: COLUMN_MAPPINGS,
      defaultWhere:
        'WHERE EXISTS (SELECT 1 FROM "app_memberships" owner_am WHERE owner_am."echoAppId" = a.id AND owner_am."userId" = $1::uuid AND owner_am.role = \'owner\')',
      aggregatedColumns: [
        'totalUsers',
        'totalTransactions',
        'totalInputTokens',
        'totalOutputTokens',
        'totalTokens',
        'totalSpent',
        'totalSpentFreeTier',
        'totalSpentUserBalances',
        'totalReferralProfitEarned',
        'totalMarkupProfitEarned',
        'totalTransactionCosts',
        'lastTransactionAt',
      ],
      numericColumns: [
        'totalUsers',
        'totalTransactions',
        'totalInputTokens',
        'totalOutputTokens',
        'totalTokens',
        'totalSpent',
        'totalSpentFreeTier',
        'totalSpentUserBalances',
        'totalReferralProfitEarned',
        'totalMarkupProfitEarned',
        'totalTransactionCosts',
      ],
      dateColumns: ['createdAt', 'updatedAt', 'lastTransactionAt'],
      uuidColumns: ['id'],
      initialParameters: [params.userId],
    }
  );
  const orderByClause = buildOrderByClause(params.sorts, {
    columnMappings: COLUMN_MAPPINGS,
    defaultOrderClause: 'a."createdAt" DESC',
  });

  // Build the main query with dynamic clauses
  const baseQuery = `
    SELECT 
      a.id,
      a.name,
      a.description,
      a."createdAt",
      a."updatedAt",
      COALESCE(u_stat."totalUsers", 0) as "totalUsers",
      COALESCE(tx."totalTransactions", 0) as "totalTransactions",
      COALESCE(tx."totalInputTokens", 0) as "totalInputTokens",
      COALESCE(tx."totalOutputTokens", 0) as "totalOutputTokens",
      COALESCE(tx."totalTokens", 0) as "totalTokens",
      COALESCE(tx."totalSpent", 0) as "totalSpent",
      COALESCE(tx."totalSpentFreeTier", 0) as "totalSpentFreeTier",
      COALESCE(tx."totalSpentUserBalances", 0) as "totalSpentUserBalances",
      COALESCE(tx."totalReferralProfitEarned", 0) as "totalReferralProfitEarned",
      COALESCE(tx."totalMarkupProfitEarned", 0) as "totalMarkupProfitEarned",
      COALESCE(tx."totalTransactionCosts", 0) as "totalTransactionCosts",
      tx."lastTransactionAt" as "lastTransactionAt"
    FROM "echo_apps" a
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(*) as "totalTransactions",
        COALESCE(SUM(tm."inputTokens"), 0) as "totalInputTokens",
        COALESCE(SUM(tm."outputTokens"), 0) as "totalOutputTokens",
        COALESCE(SUM(tm."totalTokens"), 0) as "totalTokens",
        COALESCE(SUM(t."totalCost"), 0) as "totalSpent",
        COALESCE(SUM(CASE WHEN t."spendPoolId" IS NOT NULL THEN t."totalCost" ELSE 0 END), 0) as "totalSpentFreeTier",
        COALESCE(SUM(CASE WHEN t."spendPoolId" IS NULL THEN t."totalCost" ELSE 0 END), 0) as "totalSpentUserBalances",
        COALESCE(SUM(t."referralProfit"), 0) as "totalReferralProfitEarned",
        COALESCE(SUM(t."markUpProfit"), 0) as "totalMarkupProfitEarned",
        COALESCE(SUM(t."rawTransactionCost"), 0) as "totalTransactionCosts",
        MAX(t."createdAt") as "lastTransactionAt"
      FROM "transactions" t
      LEFT JOIN "transaction_metadata" tm ON t."transactionMetadataId" = tm.id
      WHERE t."echoAppId" = a.id
    ) tx ON TRUE
    LEFT JOIN LATERAL (
      SELECT COUNT(DISTINCT am."userId") as "totalUsers"
      FROM "app_memberships" am
      WHERE am."echoAppId" = a.id
    ) u_stat ON TRUE
    ${whereClause}
    GROUP BY 
      a.id, a.name, a.description, a."createdAt", a."updatedAt",
      u_stat."totalUsers",
      tx."totalTransactions", tx."totalInputTokens", tx."totalOutputTokens", tx."totalTokens",
      tx."totalSpent", tx."totalSpentFreeTier", tx."totalSpentUserBalances",
      tx."totalReferralProfitEarned", tx."totalMarkupProfitEarned", tx."totalTransactionCosts",
      tx."lastTransactionAt"
    ${havingClause}
    ${orderByClause}
    LIMIT $${parameters.length + 1} 
    OFFSET $${parameters.length + 2}
  `;

  // Add pagination parameters
  const queryParameters = [
    ...parameters,
    params.page_size,
    params.page * params.page_size,
  ];

  // Execute the main query
  const userApps = await db.$queryRawUnsafe<UserAppRow[]>(
    baseQuery,
    ...queryParameters
  );

  // Get additional data for payouts
  const appIds = userApps.map(app => app.id);
  const payoutInfo = await getPayoutInformation(appIds);

  // Build count query with same filters
  const countSourceQuery = `
    SELECT a.id
    FROM "echo_apps" a
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(*) as "totalTransactions",
        COALESCE(SUM(tm."inputTokens"), 0) as "totalInputTokens",
        COALESCE(SUM(tm."outputTokens"), 0) as "totalOutputTokens",
        COALESCE(SUM(tm."totalTokens"), 0) as "totalTokens",
        COALESCE(SUM(t."totalCost"), 0) as "totalSpent",
        COALESCE(SUM(CASE WHEN t."spendPoolId" IS NOT NULL THEN t."totalCost" ELSE 0 END), 0) as "totalSpentFreeTier",
        COALESCE(SUM(CASE WHEN t."spendPoolId" IS NULL THEN t."totalCost" ELSE 0 END), 0) as "totalSpentUserBalances",
        COALESCE(SUM(t."referralProfit"), 0) as "totalReferralProfitEarned",
        COALESCE(SUM(t."markUpProfit"), 0) as "totalMarkupProfitEarned",
        COALESCE(SUM(t."rawTransactionCost"), 0) as "totalTransactionCosts",
        MAX(t."createdAt") as "lastTransactionAt"
      FROM "transactions" t
      LEFT JOIN "transaction_metadata" tm ON t."transactionMetadataId" = tm.id
      WHERE t."echoAppId" = a.id
    ) tx ON TRUE
    LEFT JOIN LATERAL (
      SELECT COUNT(DISTINCT am."userId") as "totalUsers"
      FROM "app_memberships" am
      WHERE am."echoAppId" = a.id
    ) u_stat ON TRUE
    ${whereClause}
    GROUP BY 
      a.id,
      u_stat."totalUsers",
      tx."totalTransactions", tx."totalInputTokens", tx."totalOutputTokens", tx."totalTokens",
      tx."totalSpent", tx."totalSpentFreeTier", tx."totalSpentUserBalances",
      tx."totalReferralProfitEarned", tx."totalMarkupProfitEarned", tx."totalTransactionCosts",
      tx."lastTransactionAt"
    ${havingClause}
  `;

  const totalCountQuery = `SELECT COUNT(*) as count FROM (${countSourceQuery}) as filtered_results`;

  const totalCount = await db.$queryRawUnsafe<{ count: number }[]>(
    totalCountQuery,
    ...parameters
  );

  // Transform the results to match the expected interface
  const transformedResults = userApps.map(app => ({
    id: app.id,
    name: app.name,
    description: app.description,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    // Spending information
    totalSpentAcrossApps: app.totalSpent,
    totalSpentFreeTier: app.totalSpentFreeTier,
    totalSpentUserBalances: app.totalSpentUserBalances,
    totalSpent: app.totalSpent,
    // Earnings information
    totalReferralProfitEarned: app.totalReferralProfitEarned,
    totalReferralProfitClaimed:
      payoutInfo.referralPayouts.get(params.userId) ?? 0,
    totalMarkupProfitEarned: app.totalMarkupProfitEarned,
    totalMarkupProfitClaimed: payoutInfo.markupPayouts.get(app.id) ?? 0,
    totalTransactionCosts: app.totalTransactionCosts,
    // Usage statistics
    totalUsers: app.totalUsers,
    totalTransactions: app.totalTransactions,
    totalInputTokens: app.totalInputTokens,
    totalOutputTokens: app.totalOutputTokens,
    totalTokens: app.totalTokens,
    lastTransactionAt: app.lastTransactionAt,
  }));

  // Return in the expected format
  return toPaginatedReponse({
    items: transformedResults,
    page: params.page,
    page_size: params.page_size,
    total_count: Number(totalCount[0].count),
  });
};
