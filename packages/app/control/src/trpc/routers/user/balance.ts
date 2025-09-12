import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../../trpc';

import { getUserGlobalBalance, getUserAppBalance } from '@/lib/balance';
import { getCustomerSpendInfoForApp } from '@/lib/spend-pools';

export const userBalanceRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getUserGlobalBalance(ctx.session.user.id);
  }),

  app: createTRPCRouter({
    get: protectedProcedure
      .input(z.object({ appId: z.string() }))
      .query(async ({ ctx, input }) => {
        return getUserAppBalance(ctx.session.user.id, input.appId);
      }),

    free: protectedProcedure
      .input(z.object({ appId: z.string() }))
      .query(async ({ ctx, input }) => {
        return getCustomerSpendInfoForApp(ctx.session.user.id, input.appId);
      }),
  }),
});
