import { TRPCError } from '@trpc/server';

import {
  createTRPCRouter,
  paginatedProcedure,
  protectedProcedure,
  publicProcedure,
  timeBasedPaginatedProcedure,
} from '../../trpc';

import { userPayoutRouter } from './payout';

import { getPublicUser, getFullUser } from '@/services/user/get';
import { getUserFeed, userFeedSchema } from '@/services/feed';
import { listCreditPayments } from '@/services/payments';
import { createPaymentLink, createPaymentLinkSchema } from '@/services/stripe';
import {
  countApiKeys,
  createApiKey,
  createApiKeySchema,
  deleteApiKey,
  deleteApiKeySchema,
  getApiKey,
  getApiKeySchema,
  listApiKeys,
  listApiKeysSchema,
  updateApiKey,
  updateApiKeySchema,
} from '@/services/api-keys';
import {
  getGithubLinkForUser,
  updateGithubLinkForUser,
  updateUserGithubLinkSchema,
} from '@/services/user/github-link';
import {
  getUserAppBalance,
  getUserGlobalBalance,
} from '@/services/user/balance';
import { appIdSchema } from '@/services/apps/lib/schemas';
import { getCustomerSpendInfoForApp } from '@/lib/spend-pools';

import { userIdSchema } from '@/services/lib/schemas';
import {
  hasClaimedInitialFreeTierCredits,
  issueInitialFreeTierCredits,
} from '@/services/user/initial-free-tier';
import {
  acceptLatestPrivacyPolicy,
  acceptLatestTermsAndServices,
  needsLatestPrivacyPolicy,
  needsLatestTermsAndServices,
} from '@/services/user/terms-agreement';
import {
  getUserCreatorActivity,
  getUserCreatorActivitySchema,
} from '@/services/user/activity';

export const userRouter = createTRPCRouter({
  payout: userPayoutRouter,

  current: protectedProcedure.query(async ({ ctx }) => {
    return getFullUser(ctx.session.user.id);
  }),

  get: publicProcedure.input(userIdSchema).query(async ({ input }) => {
    const user = await getPublicUser(input);
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }
    return user;
  }),

  balance: {
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserGlobalBalance(ctx.session.user.id);
    }),

    app: createTRPCRouter({
      get: protectedProcedure
        .input(appIdSchema)
        .query(async ({ ctx, input }) => {
          return getUserAppBalance(ctx.session.user.id, input);
        }),

      free: protectedProcedure
        .input(appIdSchema)
        .query(async ({ ctx, input }) => {
          return getCustomerSpendInfoForApp(ctx.session.user.id, input);
        }),
    }),
  },

  payments: {
    list: paginatedProcedure
      .concat(protectedProcedure)
      .query(async ({ ctx }) => {
        return await listCreditPayments(ctx.session.user.id, ctx.pagination);
      }),

    create: protectedProcedure
      .input(createPaymentLinkSchema)
      .mutation(async ({ ctx, input }) => {
        return await createPaymentLink(ctx.session.user.id, input);
      }),
  },

  feed: {
    list: timeBasedPaginatedProcedure
      .concat(protectedProcedure)
      .input(userFeedSchema)
      .query(async ({ ctx, input }) => {
        return getUserFeed(ctx.session.user.id, input, ctx.pagination);
      }),
  },

  githubLink: {
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getGithubLinkForUser(ctx.session.user.id);
    }),

    update: protectedProcedure
      .input(updateUserGithubLinkSchema)
      .mutation(async ({ ctx, input }) => {
        return await updateGithubLinkForUser(ctx.session.user.id, input);
      }),
  },

  initialFreeTier: {
    issue: protectedProcedure.mutation(async ({ ctx }) => {
      return await issueInitialFreeTierCredits(ctx.session.user.id);
    }),

    hasClaimed: protectedProcedure.query(async ({ ctx }) => {
      return await hasClaimedInitialFreeTierCredits(ctx.session.user.id);
    }),
  },

  apiKeys: {
    count: protectedProcedure
      .input(listApiKeysSchema)
      .query(async ({ ctx, input }) => {
        return countApiKeys(ctx.session.user.id, input);
      }),

    list: paginatedProcedure
      .concat(protectedProcedure)
      .input(listApiKeysSchema)
      .query(async ({ ctx: { session, pagination }, input }) => {
        return listApiKeys(session.user.id, input, pagination);
      }),

    get: protectedProcedure
      .input(getApiKeySchema)
      .query(async ({ ctx, input }) => {
        return getApiKey(ctx.session.user.id, input);
      }),

    create: protectedProcedure
      .input(createApiKeySchema)
      .mutation(async ({ ctx, input }) => {
        return createApiKey(ctx.session.user.id, input);
      }),

    update: protectedProcedure
      .input(updateApiKeySchema)
      .mutation(async ({ ctx, input }) => {
        return updateApiKey(ctx.session.user.id, input);
      }),

    delete: protectedProcedure
      .input(deleteApiKeySchema)
      .mutation(async ({ ctx, input }) => {
        return deleteApiKey(ctx.session.user.id, input);
      }),
  },

  legal: {
    needs: createTRPCRouter({
      terms: protectedProcedure.query(async ({ ctx }) => {
        return await needsLatestTermsAndServices(ctx.session.user.id);
      }),
      privacy: protectedProcedure.query(async ({ ctx }) => {
        return await needsLatestPrivacyPolicy(ctx.session.user.id);
      }),
    }),
    accept: createTRPCRouter({
      terms: protectedProcedure.mutation(async ({ ctx }) => {
        return await acceptLatestTermsAndServices(ctx.session.user.id);
      }),
      privacy: protectedProcedure.mutation(async ({ ctx }) => {
        return await acceptLatestPrivacyPolicy(ctx.session.user.id);
      }),
    }),
  },

  creatorActivity: protectedProcedure
    .input(getUserCreatorActivitySchema)
    .query(async ({ ctx, input }) => {
      return await getUserCreatorActivity(ctx.session.user.id, input);
    }),
});
