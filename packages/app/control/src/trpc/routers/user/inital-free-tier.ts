import { createTRPCRouter, protectedProcedure } from '../../trpc';
import {
  hasClaimedInitialFreeTierCredits,
  issueInitialFreeTierCredits,
} from '@/services/user/initial-free-tier';

export const userInitialFreeTierRouter = createTRPCRouter({
  issue: protectedProcedure.mutation(async ({ ctx }) => {
    return await issueInitialFreeTierCredits(ctx.session.user.id);
  }),

  hasClaimed: protectedProcedure.query(async ({ ctx }) => {
    return await hasClaimedInitialFreeTierCredits(ctx.session.user.id);
  }),
});
