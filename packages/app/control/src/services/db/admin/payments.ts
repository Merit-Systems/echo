/**
 * TRPC function that demonstrates integration with StatefulDataTable for payment history
 * This shows how to create a TRPC procedure that accepts standardized pagination,
 * sorting, and filtering parameters and returns payment data in the expected format.
 */

import type { PaginationParams } from '@/services/db/_lib/pagination';
import { toPaginatedReponse } from '@/services/db/_lib/pagination';
import type { MultiSortParams } from '@/services/db/_lib/sorting';
import { buildOrderByClause } from '@/services/db/admin/util/build-order-by-clause';
import type { FilterParams } from '@/services/db/_lib/filtering';
import { db } from '@/services/db/client';
import { buildFilterClauses } from '@/services/db/admin/util/build-filter-clause';

interface PaymentRow {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  source: string;
  description: string;
  isArchived: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  spendPoolId: string | null;
  user_id: string;
  user_name: string | null;
  user_email: string;
  spendPool_id: string | null;
  spendPool_name: string | null;
  spendPool_description: string | null;
  app_id: string | null;
  app_name: string | null;
}

// Map frontend column names to SQL expressions
const COLUMN_MAPPINGS: Record<string, string> = {
  id: 'p.id',
  paymentId: 'p."paymentId"',
  amount: 'p.amount',
  currency: 'p.currency',
  status: 'p.status',
  source: 'p.source',
  description: 'p.description',
  createdAt: 'p."createdAt"',
  updatedAt: 'p."updatedAt"',
  userId: 'u.id',
  userName: 'u.name',
  userEmail: 'u.email',
  spendPoolId: 'sp.id',
  spendPoolName: 'sp.name',
  spendPoolDescription: 'sp.description',
  appId: 'app.id',
  appName: 'app.name',
};

// Use shared builder; this service has WHERE only (no HAVING)

// Main TRPC procedure function for payment history
export const getPaymentsWithPagination = async (
  params: PaginationParams & MultiSortParams & FilterParams
) => {
  // Build dynamic clauses
  const { whereClause, parameters } = buildFilterClauses(params.filters, {
    columnMappings: COLUMN_MAPPINGS,
    defaultWhere: 'WHERE p."isArchived" = false',
    dateColumns: ['createdAt', 'updatedAt'],
    numericColumns: ['amount'],
    enumColumns: ['source'],
  });
  const orderByClause = buildOrderByClause(params.sorts, {
    columnMappings: COLUMN_MAPPINGS,
    defaultOrderClause: 'p."createdAt" DESC',
  });

  // Build the main query with dynamic clauses
  const baseQuery = `
    SELECT 
      p.id,
      p."paymentId",
      p.amount,
      p.currency,
      p.status,
      p.source,
      p.description,
      p."isArchived",
      p."archivedAt",
      p."createdAt",
      p."updatedAt",
      p."userId",
      p."spendPoolId",
      u.id as "user_id",
      u.name as "user_name",
      u.email as "user_email",
      sp.id as "spendPool_id",
      sp.name as "spendPool_name",
      sp.description as "spendPool_description",
      app.id as "app_id",
      app.name as "app_name"
    FROM "payments" p
    INNER JOIN "users" u ON p."userId" = u.id
    LEFT JOIN "spend_pools" sp ON p."spendPoolId" = sp.id
    LEFT JOIN "echo_apps" app ON sp."echoAppId" = app.id
    ${whereClause}
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
  const payments = await db.$queryRawUnsafe<PaymentRow[]>(
    baseQuery,
    ...queryParameters
  );

  // Build count query with same filters
  const countQuery = `
    SELECT COUNT(*) as count
    FROM "payments" p
    INNER JOIN "users" u ON p."userId" = u.id
    LEFT JOIN "spend_pools" sp ON p."spendPoolId" = sp.id
    LEFT JOIN "echo_apps" app ON sp."echoAppId" = app.id
    ${whereClause}
  `;

  const totalCount = await db.$queryRawUnsafe<{ count: number }[]>(
    countQuery,
    ...parameters
  );

  // Transform the results to match the expected interface
  const transformedResults = payments.map(payment => ({
    id: payment.id,
    paymentId: payment.paymentId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    source: payment.source,
    description: payment.description,
    isArchived: payment.isArchived,
    archivedAt: payment.archivedAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    userId: payment.userId,
    spendPoolId: payment.spendPoolId,
    user: {
      id: payment.user_id,
      name: payment.user_name,
      email: payment.user_email,
    },
    spendPool: payment.spendPool_id
      ? {
          id: payment.spendPool_id,
          name: payment.spendPool_name!,
          description: payment.spendPool_description,
          echoApp: {
            id: payment.app_id!,
            name: payment.app_name!,
          },
        }
      : null,
  }));

  // Return in the expected format
  return toPaginatedReponse({
    items: transformedResults,
    page: params.page,
    page_size: params.page_size,
    total_count: Number(totalCount[0].count),
  });
};
