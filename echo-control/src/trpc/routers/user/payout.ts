import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../../trpc';
import {
  calculateUserReferralEarnings,
  calculateUserReferralEarningsForApp,
  claimAllReferralRewards,
  claimReferralRewardForApp,
  PayoutStatus,
  PayoutType,
} from '@/services/payouts/referrals';
import { db } from '@/lib/db';
import {
  calculateUserMarkupEarnings,
  calculateAppMarkupEarnings,
  claimAllMarkupRewards,
  claimMarkupRewardForApp,
} from '@/services/payouts/markup';

export const userPayoutRouter = createTRPCRouter({
  referral: {
    get: protectedProcedure.query(async ({ ctx }) => {
      return await calculateUserReferralEarnings(ctx.session.user.id);
    }),

    pending: protectedProcedure.query(async ({ ctx }) => {
      return await db.payout.findMany({
        where: {
          userId: ctx.session.user.id,
          type: PayoutType.REFERRAL,
          status: PayoutStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          echoAppId: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      });
    }),

    claimForApp: protectedProcedure
      .input(z.object({ appId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const payout = await claimReferralRewardForApp(
          ctx.session.user.id,
          input.appId
        );

        const remaining = await calculateUserReferralEarningsForApp(
          ctx.session.user.id,
          input.appId
        );

        return { payout, remaining };
      }),

    claimAll: protectedProcedure.mutation(async ({ ctx }) => {
      const payouts = await claimAllReferralRewards(ctx.session.user.id);
      const earnings = await calculateUserReferralEarnings(ctx.session.user.id);
      return { payouts, earnings };
    }),
  },
  markup: {
    get: protectedProcedure.query(async ({ ctx }) => {
      return await calculateUserMarkupEarnings(ctx.session.user.id);
    }),

    pending: protectedProcedure.query(async ({ ctx }) => {
      // Only show pending markup payouts for apps owned by the user
      const ownedApps = await db.appMembership.findMany({
        where: {
          userId: ctx.session.user.id,
          role: 'owner',
          isArchived: false,
        },
        select: { echoAppId: true },
      });

      if (ownedApps.length === 0) return [];

      const appIds = ownedApps.map(a => a.echoAppId);

      return await db.payout.findMany({
        where: {
          type: PayoutType.MARKUP,
          status: PayoutStatus.PENDING,
          echoAppId: { in: appIds },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          echoAppId: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      });
    }),

    claimForApp: protectedProcedure
      .input(z.object({ appId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const payout = await claimMarkupRewardForApp(
          ctx.session.user.id,
          input.appId
        );

        const remaining = await calculateAppMarkupEarnings(input.appId);

        return { payout, remaining };
      }),

    claimAll: protectedProcedure.mutation(async ({ ctx }) => {
      const payouts = await claimAllMarkupRewards(ctx.session.user.id);
      const earnings = await calculateUserMarkupEarnings(ctx.session.user.id);
      return { payouts, earnings };
    }),
  },
});
