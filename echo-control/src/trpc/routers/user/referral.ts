import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { setUserReferrerForAppIfExists } from '@/lib/referral-codes/user-referral';

const setUserReferrerForAppIfExistsSchema = z.object({
  echoAppId: z.string().uuid(),
  code: z.string(),
});

export const userReferralRouter = createTRPCRouter({
  setUserReferrerForAppIfExists: protectedProcedure
    .input(setUserReferrerForAppIfExistsSchema)
    .mutation(async ({ ctx, input }) => {
      return setUserReferrerForAppIfExists(
        ctx.session.user.id,
        input.echoAppId,
        input.code
      );
    }),
});
