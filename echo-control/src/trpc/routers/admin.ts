import { z } from 'zod';

import { adminProcedure, createTRPCRouter, paginatedProcedure } from '../trpc';

import {
  adminGetUsers,
  adminGetAppsForUser,
  adminMintCreditsToUser,
  adminMintCreditReferralCode,
  adminMintCreditReferralCodeSchema,
  getUserEarningsAggregates,
  getAppTransactionAggregates,
  getAllUsersEarningsAggregates,
  getAllUsersEarningsAggregatesPaginated,
  getAppEarningsAcrossAllUsers,
  getUserSpendingAggregates,
  getAppSpendingAggregates,
  getAllUsersSpendingAggregates,
  getAllUsersSpendingAggregatesPaginated,
  getAppSpendingAcrossAllUsers,
  getAppTransactionsPaginated,
  getAppTransactionTotals,
  getUserTransactionsPaginated,
  getUserTransactionTotals,
} from '@/services/admin/admin';
import { mintCreditsToUserSchema } from '@/services/credits';
import { adminListPendingPayouts } from '@/services/admin/pending-payouts';
import { adminListCompletedPayouts } from '@/services/admin/completed-payouts';
import {
  generateCheckoutUrlForPayout,
  pollMeritCheckout,
  syncPendingPayoutsOnce,
} from '@/services/payouts/merit';

export const adminRouter = createTRPCRouter({
  isAdmin: adminProcedure.query(async () => {
    return true;
  }),

  mintCredits: adminProcedure
    .input(mintCreditsToUserSchema)
    .mutation(async ({ input }) => {
      await adminMintCreditsToUser(input);

      return {
        success: true,
        message: `Successfully minted $${input.amountInDollars} to user ${input.userId}`,
      };
    }),

  getUsers: adminProcedure.query(async () => {
    return await adminGetUsers();
  }),

  getAppsForUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await adminGetAppsForUser(input.userId);
    }),

  mintCreditReferralCode: adminProcedure
    .input(adminMintCreditReferralCodeSchema)
    .mutation(async ({ input }) => {
      return await adminMintCreditReferralCode(input);
    }),

  earnings: {
    /**
     * Get earnings aggregates for a specific user across all their apps
     */
    getUserEarnings: adminProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await getUserEarningsAggregates(input.userId);
      }),

    /**
     * Get transaction aggregates for a specific app
     */
    getAppEarnings: adminProcedure
      .input(z.object({ appId: z.string() }))
      .query(async ({ input }) => {
        return await getAppTransactionAggregates(input.appId);
      }),

    /**
     * Get earnings aggregates across all users and apps (global view)
     */
    getAllUsersEarnings: adminProcedure.query(async () => {
      return await getAllUsersEarningsAggregates();
    }),

    /**
     * Get paginated earnings aggregates across all users and apps
     */
    getAllUsersEarningsPaginated: paginatedProcedure
      .concat(adminProcedure)
      .query(async ({ ctx }) => {
        return await getAllUsersEarningsAggregatesPaginated(
          ctx.pagination.page,
          ctx.pagination.page_size
        );
      }),

    /**
     * Get earnings aggregates for a specific app across all users
     */
    getAppEarningsAcrossAllUsers: adminProcedure
      .input(z.object({ appId: z.string() }))
      .query(async ({ input }) => {
        return await getAppEarningsAcrossAllUsers(input.appId);
      }),
  },

  spending: {
    /**
     * Get spending aggregates for a specific user across all apps they use
     */
    getUserSpending: adminProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await getUserSpendingAggregates(input.userId);
      }),

    /**
     * Get spending aggregates for a specific app across all users
     */
    getAppSpending: adminProcedure
      .input(z.object({ appId: z.string() }))
      .query(async ({ input }) => {
        return await getAppSpendingAggregates(input.appId);
      }),

    /**
     * Get spending aggregates across all users and apps (global view)
     */
    getAllUsersSpending: adminProcedure.query(async () => {
      return await getAllUsersSpendingAggregates();
    }),

    /**
     * Get paginated spending aggregates across all users and apps
     */
    getAllUsersSpendingPaginated: paginatedProcedure
      .concat(adminProcedure)
      .query(async ({ ctx }) => {
        return await getAllUsersSpendingAggregatesPaginated(
          ctx.pagination.page,
          ctx.pagination.page_size
        );
      }),

    /**
     * Get spending aggregates for a specific app across all users with detailed breakdowns
     */
    getAppSpendingAcrossAllUsers: adminProcedure
      .input(z.object({ appId: z.string() }))
      .query(async ({ input }) => {
        return await getAppSpendingAcrossAllUsers(input.appId);
      }),
  },

  transactions: {
    /**
     * Get paginated transactions for a specific app
     */
    getAppTransactions: adminProcedure
      .input(
        z.object({
          appId: z.string(),
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(50),
        })
      )
      .query(async ({ input }) => {
        return await getAppTransactionsPaginated(
          input.appId,
          input.page,
          input.pageSize
        );
      }),

    /**
     * Get comprehensive totals for an app
     */
    getAppTransactionTotals: adminProcedure
      .input(z.object({ appId: z.string() }))
      .query(async ({ input }) => {
        return await getAppTransactionTotals(input.appId);
      }),

    /**
     * Get paginated transactions for a specific user
     */
    getUserTransactions: adminProcedure
      .input(
        z.object({
          userId: z.string(),
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(50),
        })
      )
      .query(async ({ input }) => {
        return await getUserTransactionsPaginated(
          input.userId,
          input.page,
          input.pageSize
        );
      }),

    /**
     * Get comprehensive totals for a user across all apps
     */
    getUserTransactionTotals: adminProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await getUserTransactionTotals(input.userId);
      }),
  },

  payouts: {
    listPending: paginatedProcedure
      .concat(adminProcedure)
      .query(async ({ ctx }) => {
        return await adminListPendingPayouts(ctx.pagination);
      }),
    listCompleted: paginatedProcedure
      .concat(adminProcedure)
      .query(async ({ ctx }) => {
        return await adminListCompletedPayouts(ctx.pagination);
      }),
    startMeritCheckout: adminProcedure
      .input(
        z.object({
          payoutId: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const checkoutUrl = await generateCheckoutUrlForPayout(input.payoutId);
        if (!checkoutUrl) {
          throw new Error('Checkout URL not found');
        }
        console.log('checkoutUrl', checkoutUrl);
        return { url: checkoutUrl.url };
      }),

    pollMeritCheckout: adminProcedure
      .input(z.object({ payoutId: z.string() }))
      .mutation(async ({ input }) => {
        return await pollMeritCheckout(input.payoutId);
      }),

    syncPending: adminProcedure.mutation(async () => {
      return await syncPendingPayoutsOnce();
    }),
  },
});
