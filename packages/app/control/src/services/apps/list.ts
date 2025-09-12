import z from 'zod';

import { db } from '@/lib/db';

import { countApps } from './count';

import { type PaginationParams, toPaginatedReponse } from '../lib/pagination';

import { appSelect } from './lib/select';

import type { Prisma } from '@/generated/prisma';
import { AppRole, MembershipStatus } from '@/lib/permissions';

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

  const [apps, totalCount] = await Promise.all([
    db.echoApp.findMany({
      where,
      skip: page * page_size,
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
      select: {
        ...appSelect,
        appMemberships: {
          select: {
            role: true,
            status: true,
          },
        },
      },
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
      select: {
        ...appSelect,
        appMemberships: {
          select: {
            role: true,
            status: true,
          },
        },
      },
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
