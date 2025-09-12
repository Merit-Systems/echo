import {
  createTRPCRouter,
  protectedProcedure,
  timeBasedPaginatedProcedure,
} from '../../trpc';

import { userBalanceRouter } from './balance';
import { userApiKeysRouter } from './api-keys';
import { userPaymentsRouter } from './payments';
import { userRedeemCodeRouter } from './redeem';
import { userPublicRouter } from './public';
import { userPayoutRouter } from './payout';
import { userGithubLinkRouter } from './github-link';
import { userInitialFreeTierRouter } from './inital-free-tier';
import { userTermsAgreementRouter } from './terms-agreement';

import { getUserFeed, userFeedSchema } from '@/services/feed/feed';
import { getUser } from '@/services/user';

export const userRouter = createTRPCRouter({
  balance: userBalanceRouter,
  apiKeys: userApiKeysRouter,
  payments: userPaymentsRouter,
  redeem: userRedeemCodeRouter,
  public: userPublicRouter,
  payout: userPayoutRouter,
  githubLink: userGithubLinkRouter,
  initialFreeTier: userInitialFreeTierRouter,
  termsAgreement: userTermsAgreementRouter,

  current: {
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUser(ctx.session.user.id);
    }),
  },

  feed: {
    list: timeBasedPaginatedProcedure
      .concat(protectedProcedure)
      .input(userFeedSchema)
      .query(async ({ ctx, input }) => {
        return getUserFeed(ctx.session.user.id, input, ctx.pagination);
      }),
  },
});
