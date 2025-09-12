import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { redeemCreditReferralCode } from '@/lib/referral-codes/credit-grants';

export const userRedeemCodeRouter = createTRPCRouter({
  redeem: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        freeTier: z.boolean().optional(),
        echoAppId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await redeemCreditReferralCode(
        ctx.session.user.id,
        input.code,
        input.freeTier ?? false,
        input.echoAppId
      );
    }),
});
