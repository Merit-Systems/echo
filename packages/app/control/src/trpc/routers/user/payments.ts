import {
  createTRPCRouter,
  paginatedProcedure,
  protectedProcedure,
} from '@/trpc/trpc';

import { listCreditPayments } from '@/services/payments';
import { createPaymentLink, createPaymentLinkSchema } from '@/services/stripe';

export const userPaymentsRouter = createTRPCRouter({
  list: paginatedProcedure.concat(protectedProcedure).query(async ({ ctx }) => {
    return await listCreditPayments(ctx.session.user.id, ctx.pagination);
  }),

  createLink: protectedProcedure
    .input(createPaymentLinkSchema)
    .mutation(async ({ ctx, input }) => {
      return await createPaymentLink(ctx.session.user.id, input);
    }),
});
