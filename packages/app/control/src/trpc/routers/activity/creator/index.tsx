import {
  getCreatorActivity,
  getCreatorActivitySchema,
} from '@/services/activity/creator/overview';

import { createTRPCRouter, protectedProcedure } from '../../../trpc';

export const creatorActivityRouter = createTRPCRouter({
  getCurrent: protectedProcedure
    .input(getCreatorActivitySchema.omit({ userId: true }))
    .query(async ({ ctx, input }) => {
      return getCreatorActivity({
        userId: ctx.session.user.id,
        ...input,
      });
    }),

  get: protectedProcedure
    .input(getCreatorActivitySchema)
    .query(async ({ input }) => {
      return getCreatorActivity(input);
    }),
});
