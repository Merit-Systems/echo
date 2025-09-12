import { getUser } from '@/services/user';
import { createTRPCRouter, publicProcedure } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const userPublicRouter = createTRPCRouter({
  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    const user = await getUser(input);
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }
    return user;
  }),
});
