import { db } from '@/lib/db';
import { appSelect } from './lib/select';
import { AppRole, MembershipStatus } from '@/lib/permissions';

import type { AppId } from './lib/schemas';
import { z } from 'zod';
import type { PaginationParams} from '../lib/pagination';
import { toPaginatedReponse } from '../lib/pagination';
import type { Prisma } from '@/generated/prisma';

export const getAppMembership = async (userId: string, appId: AppId) => {
  return await db.appMembership.findUnique({
    where: {
      userId_echoAppId: {
        userId,
        echoAppId: appId,
      },
    },
    select: {
      role: true,
      status: true,
      referrerId: true,
      echoApp: {
        select: appSelect,
      },
    },
  });
};

export const createAppMembershipSchema = z.object({
  referrerId: z.uuid().optional(),
});

// this will succeed whether creating a new membership or if the user is already a member
export const createAppMembership = async (
  userId: string,
  echoAppId: AppId,
  input: z.infer<typeof createAppMembershipSchema>
) => {
  return db.appMembership.upsert({
    where: {
      userId_echoAppId: {
        userId,
        echoAppId,
      },
    },
    create: {
      userId,
      echoAppId,
      role: AppRole.CUSTOMER,
      status: MembershipStatus.ACTIVE,
      totalSpent: 0,
      referrerId: input.referrerId,
    },
    update: {
      referrerId: input.referrerId,
      // Don't update any fields if the membership already exists
    },
  });
};

export const updateAppMembershipReferrerSchema = z.object({
  appId: z.uuid(),
  referrerId: z.uuid(),
});

export const updateAppMembershipReferrer = async (
  userId: string,
  input: z.infer<typeof updateAppMembershipReferrerSchema>
) => {
  console.log('updateAppMembershipReferrer', userId, input);
  return await db.appMembership.update({
    where: {
      userId_echoAppId: { userId, echoAppId: input.appId },
      referrerId: null,
    },
    data: { referrerId: input.referrerId },
  });
};

export const listAppMembershipsSchema = z.object({
  appId: z.uuid(),
  referrerUserId: z.union([z.uuid(), z.literal('any')]).optional(),
});

export const listAppMemberships = async (
  { appId, referrerUserId }: z.infer<typeof listAppMembershipsSchema>,
  { page, page_size }: PaginationParams
) => {
  const where: Prisma.AppMembershipWhereInput = {
    echoAppId: appId,
    ...(referrerUserId &&
      referrerUserId !== 'any' && {
        referrer: {
          userId: referrerUserId,
        },
      }),
    ...(referrerUserId &&
      referrerUserId === 'any' && {
        referrer: {
          userId: {
            not: null,
          },
        },
      }),
  };

  const [totalCount, memberships] = await Promise.all([
    countAppMembershipsInternal(where),
    db.appMembership.findMany({
      where,
      skip: page * page_size,
      take: page_size,
      select: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        totalSpent: true,
        referrer: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const items = memberships.map(membership => ({
    ...membership,
    totalSpent: Number(membership.totalSpent),
  }));

  return toPaginatedReponse({
    total_count: totalCount,
    items,
    page,
    page_size,
  });
};

export const countAppMemberships = async (appId: AppId) => {
  return await countAppMembershipsInternal({ echoAppId: appId });
};

const countAppMembershipsInternal = async (
  where: Prisma.AppMembershipWhereInput
) => {
  return await db.appMembership.count({ where });
};
