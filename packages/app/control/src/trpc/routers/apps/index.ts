import { z } from 'zod';

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  paginatedProcedure,
} from '@/trpc/trpc';
import { TRPCError } from '@trpc/server';

import { createApp, createAppSchema } from '@/services/apps/create';
import {
  appOwnerProcedure,
  protectedAppProcedure,
  publicAppProcedure,
} from './procedures';
import {
  countAppMemberships,
  createAppMembership,
  getAppMembership,
  listAppMemberships,
  listAppMembershipsSchema,
  createAppMembershipSchema,
  updateAppMembershipReferrer,
  updateAppMembershipReferrerSchema,
} from '@/services/apps/membership';
import {
  listAppsSchema,
  listPublicApps,
  listMemberApps,
  listOwnerApps,
} from '@/services/apps/list';
import { updateApp, updateAppSchema } from '@/services/apps/update';
import { getAppOwner } from '@/services/apps/get';
import { appIdSchema } from '@/services/apps/lib/schemas';
import {
  getAppMarkup,
  updateMarkup,
  updateMarkupSchema,
} from '@/services/apps/markup';
import {
  getGithubLink,
  updateGithubLinkSchema,
  updateGithubLink,
} from '@/services/apps/github-link';
import {
  createFreeTierPaymentLink,
  createFreeTierPaymentLinkSchema,
} from '@/services/stripe';
import {
  getFreeTierSpendPool,
  updateFreeTierSpendPool,
  updateFreeTierSpendPoolSchema,
} from '@/services/apps/free-tier';
import { listFreeTierPayments } from '@/services/payments';
import { countAppTokens } from '@/services/apps/tokens';
import {
  countAppTransactions,
  countAppTransactionsSchema,
  listAppTransactions,
  listAppTransactionsSchema,
} from '@/services/apps/transactions';
import {
  getBucketedAppStats,
  getBucketedAppStatsSchema,
  getOverallAppStats,
  getOverallAppStatsSchema,
} from '@/services/apps/stats';
import {
  listAppUsers,
  countAppUsers,
  appUsersSchema,
} from '@/services/apps/users';
import {
  countMemberApps,
  countOwnerApps,
  countPublicApps,
} from '@/services/apps/count';
import { appEarningsSchema, getAppEarnings } from '@/services/apps/earnings';
import {
  getAppReferralReward,
  setAppReferralReward,
  setAppReferralRewardSchema,
} from '@/services/apps/referral-reward';
import {
  createAppReferralCode,
  createAppReferralCodeSchema,
  getAppReferralCodeSchema,
  getReferralCodeByCode,
  getReferralCodeByCodeSchema,
  getUserAppReferralCode,
} from '@/services/apps/referral-code';
import { deleteApp, deleteAppSchema } from '@/services/apps/delete';

export const appsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createAppSchema)
    .mutation(async ({ ctx, input }) => {
      return await createApp(ctx.session.user.id, input);
    }),

  app: {
    get: publicAppProcedure.query(async ({ ctx }) => {
      return ctx.app;
    }),

    getOwner: publicProcedure.input(appIdSchema).query(async ({ input }) => {
      const owner = await getAppOwner(input);
      if (!owner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Owner not found',
        });
      }
      return owner;
    }),

    isOwner: protectedProcedure
      .input(appIdSchema)
      .query(async ({ ctx, input }) => {
        const owner = await getAppOwner(input);
        return owner?.id === ctx.session.user.id;
      }),

    update: appOwnerProcedure
      .input(updateAppSchema)
      .mutation(async ({ ctx, input }) => {
        return await updateApp(input.appId, ctx.session.user.id, input);
      }),

    delete: appOwnerProcedure
      .input(deleteAppSchema)
      .mutation(async ({ ctx, input }) => {
        return await deleteApp(ctx.session.user.id, input);
      }),

    getNumTokens: protectedProcedure
      .input(z.object({ appId: appIdSchema }))
      .query(async ({ input }) => {
        return await countAppTokens(input.appId);
      }),

    markup: {
      get: publicProcedure.input(appIdSchema).query(async ({ input }) => {
        return await getAppMarkup(input);
      }),

      update: appOwnerProcedure
        .input(updateMarkupSchema)
        .mutation(async ({ ctx, input }) => {
          return await updateMarkup(input.appId, ctx.session.user.id, input);
        }),
    },

    githubLink: {
      get: publicProcedure.input(appIdSchema).query(async ({ input }) => {
        return await getGithubLink(input);
      }),

      update: appOwnerProcedure
        .input(updateGithubLinkSchema)
        .mutation(async ({ input }) => {
          return await updateGithubLink(input.appId, input);
        }),
    },

    freeTier: {
      payments: {
        list: paginatedProcedure
          .concat(appOwnerProcedure)
          .query(async ({ input, ctx }) => {
            return await listFreeTierPayments(
              ctx.session.user.id,
              input.appId,
              ctx.pagination
            );
          }),

        create: appOwnerProcedure
          .input(createFreeTierPaymentLinkSchema)
          .mutation(async ({ ctx, input }) => {
            return await createFreeTierPaymentLink(ctx.session.user.id, input);
          }),
      },

      get: appOwnerProcedure.query(async ({ input, ctx }) => {
        return await getFreeTierSpendPool(input.appId, ctx.session.user.id);
      }),

      users: {
        list: paginatedProcedure
          .concat(appOwnerProcedure)
          .input(appUsersSchema.omit({ spendPoolId: true }))
          .query(async ({ input, ctx }) => {
            const freeTier = await getFreeTierSpendPool(
              input.appId,
              ctx.session.user.id
            );
            return await listAppUsers(
              { ...input, spendPoolId: freeTier?.id },
              ctx.pagination
            );
          }),
      },

      update: appOwnerProcedure
        .input(updateFreeTierSpendPoolSchema)
        .mutation(async ({ ctx, input }) => {
          return await updateFreeTierSpendPool(
            input.appId,
            ctx.session.user.id,
            input
          );
        }),
    },

    referralReward: {
      get: publicProcedure.input(appIdSchema).query(async ({ input }) => {
        return await getAppReferralReward(input);
      }),

      set: appOwnerProcedure
        .input(setAppReferralRewardSchema)
        .mutation(async ({ ctx, input }) => {
          return await setAppReferralReward(
            input.appId,
            ctx.session.user.id,
            input
          );
        }),
    },

    referralCode: {
      get: {
        byUser: protectedProcedure
          .input(getAppReferralCodeSchema)
          .query(async ({ input, ctx }) => {
            return await getUserAppReferralCode(ctx.session.user.id, input);
          }),
        byCode: protectedProcedure
          .input(getReferralCodeByCodeSchema)
          .query(async ({ input }) => {
            return await getReferralCodeByCode(input);
          }),
      },

      create: protectedProcedure
        .input(createAppReferralCodeSchema)
        .mutation(async ({ input, ctx }) => {
          return await createAppReferralCode(ctx.session.user.id, input);
        }),
    },

    transactions: {
      list: paginatedProcedure
        .concat(protectedProcedure)
        .input(listAppTransactionsSchema)
        .query(async ({ input, ctx }) => {
          return await listAppTransactions(input, ctx.pagination);
        }),
      count: protectedProcedure
        .input(countAppTransactionsSchema)
        .query(async ({ input }) => {
          return await countAppTransactions(input);
        }),
    },

    users: {
      list: paginatedProcedure
        .concat(protectedProcedure)
        .input(appUsersSchema)
        .query(async ({ input, ctx }) => {
          return await listAppUsers(input, ctx.pagination);
        }),

      count: protectedProcedure
        .input(appUsersSchema)
        .query(async ({ input }) => {
          return await countAppUsers(input);
        }),
    },

    stats: {
      bucketed: protectedProcedure
        .input(getBucketedAppStatsSchema)
        .query(async ({ input }) => {
          return await getBucketedAppStats(input);
        }),

      overall: publicProcedure
        .input(getOverallAppStatsSchema)
        .query(async ({ input }) => {
          return await getOverallAppStats(input);
        }),
    },

    earnings: {
      get: protectedProcedure
        .input(appEarningsSchema)
        .query(async ({ input }) => {
          return await getAppEarnings(input);
        }),
    },

    memberships: {
      create: protectedAppProcedure
        .input(createAppMembershipSchema)
        .mutation(async ({ ctx, input }) => {
          return await createAppMembership(
            ctx.session.user.id,
            ctx.app.id,
            input
          );
        }),

      update: {
        referrer: protectedAppProcedure
          .input(updateAppMembershipReferrerSchema)
          .mutation(async ({ ctx, input }) => {
            return await updateAppMembershipReferrer(
              ctx.session.user.id,
              input
            );
          }),
      },

      get: protectedAppProcedure.query(async ({ ctx }) => {
        return await getAppMembership(ctx.session.user.id, ctx.app.id);
      }),

      count: protectedProcedure.input(appIdSchema).query(async ({ input }) => {
        return await countAppMemberships(input);
      }),

      list: paginatedProcedure
        .concat(protectedProcedure)
        .input(listAppMembershipsSchema)
        .query(async ({ input, ctx }) => {
          return await listAppMemberships(input, ctx.pagination);
        }),
    },
  },

  list: {
    public: paginatedProcedure
      .concat(publicProcedure)
      .input(listAppsSchema)
      .query(async ({ input, ctx }) => {
        return await listPublicApps(input, ctx.pagination);
      }),

    member: paginatedProcedure
      .concat(protectedProcedure)
      .input(listAppsSchema)
      .query(async ({ input, ctx }) => {
        return await listMemberApps(ctx.session.user.id, input, ctx.pagination);
      }),

    owner: paginatedProcedure
      .concat(protectedProcedure)
      .input(listAppsSchema)
      .query(async ({ input, ctx }) => {
        return await listOwnerApps(ctx.session.user.id, input, ctx.pagination);
      }),
  },

  count: {
    public: publicProcedure.query(async () => {
      return await countPublicApps();
    }),

    member: protectedProcedure.query(async ({ ctx }) => {
      return await countMemberApps(ctx.session.user.id);
    }),

    owner: protectedProcedure.query(async ({ ctx }) => {
      return await countOwnerApps(ctx.session.user.id);
    }),
  },
});
