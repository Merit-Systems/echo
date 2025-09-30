/**
 * Example TRPC function that demonstrates integration with StatefulDataTable
 * This shows how to create a TRPC procedure that accepts standardized pagination,
 * sorting, and filtering parameters and returns data in the expected format.
 */

import type { PaginationParams } from '@/services/db/_lib/pagination';
import { toPaginatedReponse } from '@/services/db/_lib/pagination';
import type { MultiSortParams } from '@/services/db/_lib/sorting';
import { buildOrderByClause } from '@/services/db/admin/util/build-order-by-clause';
import type { FilterParams } from '@/services/db/_lib/filtering';
import { db } from '@/services/db/client';
import { buildFilterClauses } from '@/services/db/admin/util/build-filter-clause';

interface UserEarningsRow {
  id: string;
  name: string;
  email: string;
  totalRevenue: number;
  totalAppProfit: number;
  totalMarkupProfit: number;
  totalReferralProfit: number;
  transactionCount: number;
  referralCodesGenerated: number;
  referredUsersCount: number;
  totalCompletedPayouts: number;
  createdAt: Date;
  updatedAt: Date;
}

// Map frontend column names to SQL expressions
const COLUMN_MAPPINGS: Record<string, string> = {
  id: 'u.id',
  name: 'u.name',
  email: 'u.email',
  totalRevenue: 'COALESCE(t_agg."totalRevenue", 0)',
  totalAppProfit: 'COALESCE(t_agg."totalAppProfit", 0)',
  totalMarkupProfit: 'COALESCE(t_agg."totalMarkupProfit", 0)',
  totalReferralProfit: 'COALESCE(t_agg."totalReferralProfit", 0)',
  transactionCount: 'COALESCE(t_agg."transactionCount", 0)',
  referralCodesGenerated: 'COUNT(DISTINCT rc.id)',
  referredUsersCount: 'COUNT(DISTINCT am_referred.id)',
  totalCompletedPayouts:
    'COALESCE(SUM(p."amount") FILTER (WHERE p."status" = \'COMPLETED\'::"EnumPayoutStatus"), 0)',
  createdAt: 'u."createdAt"',
  updatedAt: 'u."updatedAt"',
};

// Example TRPC procedure function
export const getUserEarningsWithPagination = async (
  params: PaginationParams & MultiSortParams & FilterParams
) => {
  // Build dynamic clauses
  const { whereClause, havingClause, parameters } = buildFilterClauses(
    params.filters,
    {
      columnMappings: COLUMN_MAPPINGS,
      defaultWhere: "WHERE am.role = 'owner'",
      aggregatedColumns: [
        'totalRevenue',
        'totalAppProfit',
        'totalMarkupProfit',
        'totalReferralProfit',
        'transactionCount',
        'referralCodesGenerated',
        'referredUsersCount',
        'totalCompletedPayouts',
      ],
    }
  );
  const orderByClause = buildOrderByClause(params.sorts, {
    columnMappings: COLUMN_MAPPINGS,
    defaultOrderClause: 'u."createdAt" DESC',
  });

  // Build the main query with dynamic clauses
  const baseQuery = `
    SELECT 
      u.id,
      u.name,
      u.email,
      COALESCE(t_agg."totalRevenue", 0) as "totalRevenue",
      COALESCE(t_agg."totalAppProfit", 0) as "totalAppProfit", 
      COALESCE(t_agg."totalMarkupProfit", 0) as "totalMarkupProfit",
      COALESCE(t_agg."totalReferralProfit", 0) as "totalReferralProfit",
      COALESCE(t_agg."transactionCount", 0) as "transactionCount",
      COALESCE(
        array_agg(DISTINCT oes."emailCampaignId") FILTER (WHERE oes."emailCampaignId" IS NOT NULL),
        '{}'::text[]
      ) as "uniqueEmailCampaigns",
      COUNT(DISTINCT rc.id) as "referralCodesGenerated",
      COUNT(DISTINCT am_referred.id) as "referredUsersCount",
      COALESCE(SUM(p."amount") FILTER (WHERE p."status" = 'COMPLETED'::"EnumPayoutStatus"), 0) as "totalCompletedPayouts",
      u."createdAt",
      u."updatedAt"
    FROM "users" u
    INNER JOIN "app_memberships" am ON u.id = am."userId" 
    LEFT JOIN (
      SELECT 
        "userId",
        SUM("totalCost") as "totalRevenue",
        SUM("appProfit") as "totalAppProfit",
        SUM("markUpProfit") as "totalMarkupProfit", 
        SUM("referralProfit") as "totalReferralProfit",
        COUNT(*) as "transactionCount"
      FROM "transactions"
      GROUP BY "userId"
    ) t_agg ON u.id = t_agg."userId"
    LEFT JOIN "outbound_emails_sent" oes ON u.id = oes."userId"
    LEFT JOIN "referral_codes" rc ON u.id = rc."userId"
    LEFT JOIN "app_memberships" am_referred ON rc.id = am_referred."referrerId"
    LEFT JOIN "payouts" p ON u.id = p."userId"
    ${whereClause}
    GROUP BY u.id, u.name, u.email, u."createdAt", u."updatedAt", t_agg."totalRevenue", t_agg."totalAppProfit", t_agg."totalMarkupProfit", t_agg."totalReferralProfit", t_agg."transactionCount"
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
  const usersWithEarnings = await db.$queryRawUnsafe<UserEarningsRow[]>(
    baseQuery,
    ...queryParameters
  );

  // Build count query with same filters
  const countQuery = `
    SELECT COUNT(DISTINCT u.id) as count
    FROM "users" u
    INNER JOIN "app_memberships" am ON u.id = am."userId"
    LEFT JOIN (
      SELECT 
        "userId",
        SUM("totalCost") as "totalRevenue",
        SUM("appProfit") as "totalAppProfit",
        SUM("markUpProfit") as "totalMarkupProfit", 
        SUM("referralProfit") as "totalReferralProfit",
        COUNT(*) as "transactionCount"
      FROM "transactions"
      GROUP BY "userId"
    ) t_agg ON u.id = t_agg."userId"
    LEFT JOIN "outbound_emails_sent" oes ON u.id = oes."userId"
    LEFT JOIN "referral_codes" rc ON u.id = rc."userId"
    LEFT JOIN "app_memberships" am_referred ON rc.id = am_referred."referrerId"
    LEFT JOIN "payouts" p ON u.id = p."userId"
    ${whereClause}
    ${havingClause ? `GROUP BY u.id, t_agg."totalRevenue", t_agg."totalAppProfit", t_agg."totalMarkupProfit", t_agg."totalReferralProfit", t_agg."transactionCount" ${havingClause}` : ''}
  `;

  // If we have HAVING clauses, we need to count the grouped results
  const totalCountQuery = havingClause
    ? `SELECT COUNT(*) as count FROM (${countQuery}) as filtered_results`
    : countQuery;

  const totalCount = await db.$queryRawUnsafe<{ count: number }[]>(
    totalCountQuery,
    ...parameters
  );

  // Return in the expected format
  return toPaginatedReponse({
    items: usersWithEarnings,
    page: params.page,
    page_size: params.page_size,
    total_count: Number((totalCount[0] as { count: number }).count),
  });
};
