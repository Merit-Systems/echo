import { createTRPCRouter, protectedProcedure } from '../../trpc';
import {
  getGithubLinkForUser,
  updateGithubLinkForUser,
  updateUserGithubLinkSchema,
} from '@/services/user/github-link';

export const userGithubLinkRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await getGithubLinkForUser(ctx.session.user.id);
  }),

  update: protectedProcedure
    .input(updateUserGithubLinkSchema)
    .mutation(async ({ ctx, input }) => {
      return await updateGithubLinkForUser(ctx.session.user.id, input);
    }),
});
