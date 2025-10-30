import { createTRPCRouter } from '../../trpc';

import { adminBaseProcedures } from './base';
import { adminEarningsRouter } from './earnings';
import { adminAppRouter } from './app';
import { adminUserRouter } from './user';
import { adminSpendingRouter } from './spending';
import { adminPayoutsRouter } from './payouts';
import { adminPaymentsRouter } from './payments';
import { adminEmailCampaignsRouter } from './email-campaigns';
import { adminCreditGrantsRouter } from './credit-grants';
import { adminTokensRouter } from './tokens';
import { adminWalletRouter } from './wallet';

export const adminRouter = createTRPCRouter({
  ...adminBaseProcedures,
  earnings: adminEarningsRouter,
  app: adminAppRouter,
  user: adminUserRouter,
  spending: adminSpendingRouter,
  payouts: adminPayoutsRouter,
  payments: adminPaymentsRouter,
  emailCampaigns: adminEmailCampaignsRouter,
  creditGrants: adminCreditGrantsRouter,
  tokens: adminTokensRouter,
  wallet: adminWalletRouter,
});
