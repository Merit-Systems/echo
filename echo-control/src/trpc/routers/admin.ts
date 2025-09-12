import { z } from 'zod';

import {
  adminProcedure,
  createTRPCRouter,
  paginatedProcedure,
  protectedProcedure,
} from '../trpc';

import {
  adminGetUsers,
  adminGetAppsForUser,
  adminMintCreditsToUser,
  adminMintCreditReferralCode,
  adminMintCreditReferralCodeSchema,
  downloadUsersCsv,
  downloadUsersCsvSchema,
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
  isAdmin,
} from '@/services/admin/admin';
import {
  getUsersEarningsWithCampaignsPaginated,
  getUserEarningsWithCampaigns,
} from '@/services/admin/user-earnings-with-campaigns';
import {
  getUsersSpendingEnhancedPaginated,
  getUserSpendingEnhanced,
} from '@/services/admin/user-spending-enhanced';
import {
  getGlobalPaymentsAndSpending,
  getGlobalPaymentsAndSpendingPaginated,
} from '@/services/admin/payments-global';
import { mintCreditsToUserSchema } from '@/services/credits';
import { adminListPendingPayouts } from '@/services/admin/pending-payouts';
import { adminListCompletedPayouts } from '@/services/admin/completed-payouts';
import {
  generateCheckoutUrlForPayout,
  pollMeritCheckout,
  syncPendingPayoutsOnce,
} from '@/services/payouts/merit';
import {
  listAvailableEmailCampaigns,
  getSentCampaignsForApps,
  scheduleCampaignForApps,
} from '@/services/admin/email-campaigns';
import { getAppsEarningsPaginatedWithCampaigns } from '@/services/admin/app-earnings';

export const adminRouter = createTRPCRouter({
  isAdmin: protectedProcedure.query(async ({ ctx }) => {
    return await isAdmin(ctx.session.user.id);
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

  downloadUsersCsv: adminProcedure
    .input(downloadUsersCsvSchema)
    .mutation(async ({ input }) => {
      return await downloadUsersCsv(input);
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
     * App-centric earnings list with outbound campaign info and filters
     */
    getAppsWithCampaignsPaginated: paginatedProcedure
      .input(
        z.object({
          cursor: z.number().optional().default(0),
          page_size: z.number().optional().default(10),
          filterCampaignKey: z.string().optional(),
          onlyNotReceived: z.boolean().optional().default(false),
        })
      )
      .concat(adminProcedure)
      .query(async ({ input }) => {
        return await getAppsEarningsPaginatedWithCampaigns(
          input.cursor ?? 0,
          input.page_size ?? 10,
          input.filterCampaignKey,
          input.onlyNotReceived
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

    /**
     * Get user earnings with email campaigns information - paginated
     */
    getUsersEarningsWithCampaignsPaginated: adminProcedure
      .input(
        z.object({
          page: z.number().min(0).default(0),
          pageSize: z.number().min(1).max(100).default(25),
          searchTerm: z.string().optional(),
          sortField: z.string().optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
        })
      )
      .query(async ({ input }) => {
        return await getUsersEarningsWithCampaignsPaginated(
          input.page,
          input.pageSize,
          input.searchTerm,
          input.sortField,
          input.sortDirection
        );
      }),

    /**
     * Get single user earnings with email campaigns information
     */
    getUserEarningsWithCampaigns: adminProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await getUserEarningsWithCampaigns(input.userId);
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

    /**
     * Get enhanced user spending information with free tier and payment breakdown - paginated
     */
    getUsersSpendingEnhancedPaginated: adminProcedure
      .input(
        z.object({
          page: z.number().min(0).default(0),
          pageSize: z.number().min(1).max(100).default(25),
          searchTerm: z.string().optional(),
          sortField: z.string().optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
        })
      )
      .query(async ({ input }) => {
        return await getUsersSpendingEnhancedPaginated(
          input.page,
          input.pageSize,
          input.searchTerm,
          input.sortField,
          input.sortDirection
        );
      }),

    /**
     * Get single user enhanced spending information
     */
    getUserSpendingEnhanced: adminProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await getUserSpendingEnhanced(input.userId);
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

  paymentsGlobal: {
    /**
     * Get global payments and spending summary
     */
    getSummary: adminProcedure.query(async () => {
      return await getGlobalPaymentsAndSpending();
    }),

    /**
     * Get global payments and spending with paginated payment details
     */
    getPaginated: adminProcedure
      .input(
        z.object({
          page: z.number().min(0).default(0),
          pageSize: z.number().min(1).max(100).default(25),
          searchTerm: z.string().optional(),
          sortField: z.string().optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
        })
      )
      .query(async ({ input }) => {
        return await getGlobalPaymentsAndSpendingPaginated(
          input.page,
          input.pageSize,
          input.searchTerm,
          input.sortField,
          input.sortDirection
        );
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

  emailCampaigns: {
    list: adminProcedure.query(async () => {
      return listAvailableEmailCampaigns();
    }),
    getSentForApps: adminProcedure
      .input(z.object({ appIds: z.array(z.string()) }))
      .query(async ({ input }) => {
        return await getSentCampaignsForApps(input.appIds);
      }),
    scheduleForApps: adminProcedure
      .input(
        z.object({
          campaignKey: z.string(),
          appIds: z.array(z.string()),
        })
      )
      .mutation(async ({ input }) => {
        return await scheduleCampaignForApps(input);
      }),
  },
});
