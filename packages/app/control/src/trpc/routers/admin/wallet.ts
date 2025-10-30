import { adminProcedure, createTRPCRouter } from '../../trpc';
import {
  getEchoX402ProfitTotal,
  getSmartAccountAddress,
  getSmartAccountUSDCBalance,
  getSmartAccountETHBalance,
  fundEchoRepo,
  getEchoPayoutHistory,
  getX402AppProfit,
  getX402AppProfitByApp,
  PayoutX402AppProfit,
  getX402RawTransactionCostTotal,
} from '@/services/db/admin/wallet';
import { z } from 'zod';

export const adminWalletRouter = createTRPCRouter({
  getEchoX402ProfitTotal: adminProcedure.query(async () => {
    return await getEchoX402ProfitTotal();
  }),
  getSmartAccountAddress: adminProcedure.query(async () => {
    return await getSmartAccountAddress();
  }),
  getSmartAccountUSDCBalance: adminProcedure.query(async () => {
    return await getSmartAccountUSDCBalance();
  }),
  getSmartAccountETHBalance: adminProcedure.query(async () => {
    return await getSmartAccountETHBalance();
  }),
  getEchoPayoutHistory: adminProcedure.query(async () => {
    return await getEchoPayoutHistory();
  }),
  fundEchoRepo: adminProcedure
    .input(z.object({ amount: z.number().positive() }))
    .mutation(async ({ input }) => {
      return await fundEchoRepo(input.amount);
    }),
  getX402AppProfit: adminProcedure.query(async () => {
    return await getX402AppProfit();
  }),
  getX402AppProfitByApp: adminProcedure.query(async () => {
    return await getX402AppProfitByApp();
  }),
  payoutX402AppProfit: adminProcedure
    .input(
      z.object({
        appId: z.string().uuid(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ input }) => {
      return await PayoutX402AppProfit(input.appId, input.amount);
    }),
  getX402RawTransactionCostTotal: adminProcedure.query(async () => {
    return await getX402RawTransactionCostTotal();
  }),
});
