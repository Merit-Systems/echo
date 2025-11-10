import z from 'zod';

import { db } from '@/services/db/client';

import { countApps } from './count';

import { type PaginationParams, toPaginatedReponse } from '../_lib/pagination';

import { appSelect } from './lib/select';

import type { Prisma } from '@/generated/prisma';
import { AppRole, MembershipStatus } from '@/services/db/apps/permissions';

export const listAppsSchema = z.object({
  search: z.string().optional(),
});

type ListAppsParams = z.infer<typeof listAppsSchema>;

export const listPublicApps = async (
  { search }: ListAppsParams,
  { page, page_size }: PaginationParams
) => {
  const where: Prisma.EchoAppWhereInput = {
    isPublic: true,
    isArchived: false,
  };

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  // Get app IDs sorted by total cost using raw SQL
  let sortedAppIds: Array<{ id: string }>;

  if (search) {
    sortedAppIds = await db.$queryRaw<Array<{ id: string }>>`
      SELECT e.id
      FROM echo_apps e
      LEFT JOIN (
        SELECT 
          "echoAppId",
          COALESCE(SUM("totalCost"), 0) as total_cost
        FROM transactions
        WHERE "isArchived" = false
        GROUP BY "echoAppId"
      ) t ON e.id = t."echoAppId"
      WHERE e."isPublic" = true
        AND e."isArchived" = false
        AND e.name ILIKE ${`%${search}%`}
      ORDER BY COALESCE(t.total_cost, 0) DESC
      LIMIT ${page_size}
      OFFSET ${page * page_size}
    `;
  } else {
    sortedAppIds = await db.$queryRaw<Array<{ id: string }>>`
      SELECT e.id
      FROM echo_apps e
      LEFT JOIN (
        SELECT 
          "echoAppId",
          COALESCE(SUM("totalCost"), 0) as total_cost
        FROM transactions
        WHERE "isArchived" = false
        GROUP BY "echoAppId"
      ) t ON e.id = t."echoAppId"
      WHERE e."isPublic" = true
        AND e."isArchived" = false
      ORDER BY COALESCE(t.total_cost, 0) DESC
      LIMIT ${page_size}
      OFFSET ${page * page_size}
    `;
  }

  const appIds = sortedAppIds.map(row => row.id);

  // Fetch full app data maintaining the sort order
  const [apps, totalCount] = await Promise.all([
    appIds.length > 0
      ? db.echoApp.findMany({
          where: { id: { in: appIds } },
          select: appSelect,
        })
      : [],
    countApps(where),
  ]);

  // Sort apps to match the original order from the query
  const appsMap = new Map(apps.map(app => [app.id, app]));
  const sortedApps = appIds
    .map(id => appsMap.get(id))
    .filter((app): app is NonNullable<typeof app> => app !== undefined);

  return toPaginatedReponse({
    items: sortedApps,
    page,
    page_size,
    total_count: totalCount,
  });
};

export const listMemberApps = async (
  userId: string,
  { search }: ListAppsParams,
  { page, page_size }: PaginationParams
) => {
  const where: Prisma.EchoAppWhereInput = {
    isArchived: false,
    appMemberships: {
      some: {
        userId,
        status: MembershipStatus.ACTIVE,
      },
    },
  };

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const skip = page * page_size;

  const [apps, totalCount] = await Promise.all([
    db.echoApp.findMany({
      where,
      skip,
      take: page_size,
      select: appSelect,
      orderBy: {
        Transactions: {
          _count: 'desc',
        },
      },
    }),
    countApps(where),
  ]);

  return toPaginatedReponse({
    items: apps,
    page,
    page_size,
    total_count: totalCount,
  });
};

export const listOwnerApps = async (
  userId: string,
  { search }: ListAppsParams,
  { page, page_size }: PaginationParams
) => {
  const where: Prisma.EchoAppWhereInput = {
    isArchived: false,
    appMemberships: {
      some: { userId, role: AppRole.OWNER },
    },
  };

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const skip = page * page_size;

  const [apps, totalCount] = await Promise.all([
    db.echoApp.findMany({
      where,
      skip,
      take: page_size,
      select: appSelect,
      orderBy: {
        Transactions: {
          _count: 'desc',
        },
      },
    }),
    countApps(where),
  ]);

  return toPaginatedReponse({
    items: apps,
    page,
    page_size,
    total_count: totalCount,
  });
};
