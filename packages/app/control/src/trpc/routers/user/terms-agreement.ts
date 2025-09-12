import { createTRPCRouter, protectedProcedure } from '../../trpc';
import {
  acceptLatestPrivacyPolicy,
  acceptLatestTermsAndServices,
  needsLatestPrivacyPolicy,
  needsLatestTermsAndServices,
} from '@/services/user/terms-agreement';

export const userTermsAgreementRouter = createTRPCRouter({
  needs: createTRPCRouter({
    terms: protectedProcedure.query(async ({ ctx }) => {
      return await needsLatestTermsAndServices(ctx.session.user.id);
    }),
    privacy: protectedProcedure.query(async ({ ctx }) => {
      return await needsLatestPrivacyPolicy(ctx.session.user.id);
    }),
  }),
  accept: createTRPCRouter({
    terms: protectedProcedure.mutation(async ({ ctx }) => {
      return await acceptLatestTermsAndServices(ctx.session.user.id);
    }),
    privacy: protectedProcedure.mutation(async ({ ctx }) => {
      return await acceptLatestPrivacyPolicy(ctx.session.user.id);
    }),
  }),
});
