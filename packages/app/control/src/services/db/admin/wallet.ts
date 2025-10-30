import { db } from '@/services/db/client';
import {
  EnumTransactionType,
  EnumPayoutStatus,
  EnumPayoutType,
  type Payout,
} from '@/generated/prisma';
import { getSmartAccount } from '@/services/crypto/smart-account';
import {
  getERC20Balance,
  getEthereumBalance,
} from '@/services/crypto/get-balance';
import {
  fundRepo,
  type FundRepoResult,
  MERIT_CONTRACT_ADDRESS,
} from '@/services/crypto/fund-repo';
import { transfer, type TransferResult } from '@/services/crypto/transfer';
import { logger } from '@/logger';
import type { Address } from 'viem';
import { Decimal } from '@prisma/client/runtime/library';
import { env } from '@/env';

const USDC_ADDRESS = env.USDC_ADDRESS as Address;
const MERIT_REPO_ID = env.MERIT_REPO_ID;
const ECHO_PAYOUTS_ADDRESS = env.ECHO_PAYOUTS_ADDRESS as Address;
const NETWORK = 'base' as const;
const USDC_DECIMALS = 6;
const ETH_DECIMALS = 18;

export async function getEchoX402ProfitTotal(): Promise<number> {
  const profitResult = await db.transaction.aggregate({
    where: {
      transactionType: EnumTransactionType.X402,
      isArchived: false,
    },
    _sum: {
      echoProfit: true,
    },
  });

  const payoutResult = await db.payout.aggregate({
    where: {
      type: EnumPayoutType.ECHO_PROFIT,
    },
    _sum: {
      amount: true,
    },
  });

  const totalProfit = new Decimal(profitResult._sum.echoProfit ?? 0);
  const totalPayouts = new Decimal(payoutResult._sum.amount ?? 0);

  return totalProfit.minus(totalPayouts).toNumber();
}

export async function getX402RawTransactionCostTotal(): Promise<number> {
  const result = await db.transaction.aggregate({
    where: {
      transactionType: EnumTransactionType.X402,
      isArchived: false,
    },
    _sum: {
      rawTransactionCost: true,
    },
  });

  return new Decimal(result._sum.rawTransactionCost ?? 0).toNumber();
}

export async function getSmartAccountAddress(): Promise<string> {
  const { smartAccount } = await getSmartAccount();
  return smartAccount.address;
}

export async function getSmartAccountUSDCBalance(): Promise<number> {
  if (!USDC_ADDRESS) {
    throw new Error('USDC_ADDRESS environment variable not set');
  }

  const { smartAccount } = await getSmartAccount();
  const balanceBigInt = await getERC20Balance(
    NETWORK,
    USDC_ADDRESS,
    smartAccount.address
  );

  return Number(balanceBigInt) / 10 ** USDC_DECIMALS;
}

export async function getSmartAccountETHBalance(): Promise<number> {
  const { smartAccount } = await getSmartAccount();
  const balanceBigInt = await getEthereumBalance(NETWORK, smartAccount.address);

  return Number(balanceBigInt) / 10 ** ETH_DECIMALS;
}

export async function fundEchoRepo(amount: number): Promise<FundRepoResult> {
  if (!MERIT_REPO_ID) {
    throw new Error('MERIT_REPO_ID environment variable not set');
  }

  if (!amount || amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const result = await fundRepo(amount, Number(MERIT_REPO_ID));

  await db.payout.create({
    data: {
      type: EnumPayoutType.ECHO_PROFIT,
      status: EnumPayoutStatus.COMPLETED,
      amount: amount,
      description: `Echo profit payout to Merit repository`,
      transactionId: result.userOpHash,
      senderAddress: result.smartAccountAddress,
      recipientAddress: MERIT_CONTRACT_ADDRESS,
    },
  });

  logger.emit({
    severityText: 'INFO',
    body: 'Created ECHO_PROFIT payout record',
    attributes: {
      amount,
      userOpHash: result.userOpHash,
      smartAccountAddress: result.smartAccountAddress,
    },
  });

  return result;
}

export async function getEchoPayoutHistory(): Promise<Payout[]> {
  return await db.payout.findMany({
    where: {
      type: EnumPayoutType.ECHO_PROFIT,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });
}

export async function getX402AppProfit(): Promise<number> {
  const profitResult = await db.transaction.aggregate({
    where: {
      transactionType: EnumTransactionType.X402,
      isArchived: false,
    },
    _sum: {
      appProfit: true,
    },
  });

  const payoutResult = await db.payout.aggregate({
    where: {
      type: EnumPayoutType.APP_PROFIT,
    },
    _sum: {
      amount: true,
    },
  });

  const totalProfit = new Decimal(profitResult._sum.appProfit ?? 0);
  const totalPayouts = new Decimal(payoutResult._sum.amount ?? 0);

  return totalProfit.minus(totalPayouts).toNumber();
}

interface AppProfitBreakdown {
  appId: string;
  appName: string;
  totalProfit: number;
  totalPayouts: number;
  remainingProfit: number;
}

export async function getX402AppProfitByApp(): Promise<AppProfitBreakdown[]> {
  const profitByApp = await db.transaction.groupBy({
    by: ['echoAppId'],
    where: {
      transactionType: EnumTransactionType.X402,
      isArchived: false,
      echoAppId: { not: null },
    },
    _sum: {
      appProfit: true,
    },
  });

  const payoutsByApp = await db.payout.groupBy({
    by: ['echoAppId'],
    where: {
      type: EnumPayoutType.APP_PROFIT,
      echoAppId: { not: null },
    },
    _sum: {
      amount: true,
    },
  });

  const payoutsMap = new Map(
    payoutsByApp.map(p => [p.echoAppId, new Decimal(p._sum.amount ?? 0)])
  );

  const appIds = profitByApp
    .map(p => p.echoAppId)
    .filter((id): id is string => id !== null);

  const apps = await db.echoApp.findMany({
    where: {
      id: { in: appIds },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const appsMap = new Map(apps.map(a => [a.id, a.name]));

  return profitByApp
    .filter((p): p is typeof p & { echoAppId: string } => p.echoAppId !== null)
    .map(p => {
      const totalProfit = new Decimal(p._sum.appProfit ?? 0);
      const totalPayouts = payoutsMap.get(p.echoAppId) ?? new Decimal(0);
      const remainingProfit = totalProfit.minus(totalPayouts);

      return {
        appId: p.echoAppId,
        appName: appsMap.get(p.echoAppId) ?? 'Unknown App',
        totalProfit: totalProfit.toNumber(),
        totalPayouts: totalPayouts.toNumber(),
        remainingProfit: remainingProfit.toNumber(),
      };
    })
    .sort((a, b) => b.remainingProfit - a.remainingProfit);
}

export async function PayoutX402AppProfit(
  appId: string,
  amount: number
): Promise<TransferResult> {
  if (!ECHO_PAYOUTS_ADDRESS) {
    throw new Error('ECHO_PAYOUTS_ADDRESS environment variable not set');
  }

  if (!amount || amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const app = await db.echoApp.findUnique({
    where: { id: appId },
    select: { id: true, name: true },
  });

  if (!app) {
    throw new Error(`App with ID ${appId} not found`);
  }

  const amountBigInt = BigInt(Math.round(amount * 10 ** USDC_DECIMALS));

  const result = await transfer({
    recipientAddress: ECHO_PAYOUTS_ADDRESS,
    amount: amountBigInt,
    token: 'usdc',
    network: NETWORK,
  });

  await db.payout.create({
    data: {
      type: EnumPayoutType.APP_PROFIT,
      status: EnumPayoutStatus.COMPLETED,
      amount: amount,
      echoAppId: appId,
      description: `App profit payout for ${app.name}`,
      transactionId: result.userOpHash,
      senderAddress: result.smartAccountAddress,
      recipientAddress: ECHO_PAYOUTS_ADDRESS,
    },
  });

  logger.emit({
    severityText: 'INFO',
    body: 'Created APP_PROFIT payout record',
    attributes: {
      appId,
      appName: app.name,
      amount,
      userOpHash: result.userOpHash,
      smartAccountAddress: result.smartAccountAddress,
      recipientAddress: ECHO_PAYOUTS_ADDRESS,
    },
  });

  return result;
}
