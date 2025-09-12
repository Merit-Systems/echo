import type { SpendPool, Payment } from '@/generated/prisma';
import type { PrismaClient } from '@/generated/prisma';
import { UserSpendInfo } from './types';

// Export types
export type { UserSpendInfo };

// Export functions from fetch-user-spend.ts
export { getCustomerSpendInfoForApp } from './fetch-user-spend';

/**
 * Internal function to fund a spend pool within an existing transaction
 */
async function fundSpendPoolInternal(
  tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0],
  spendPoolId: string,
  paymentId: string,
  amount: number
): Promise<void> {
  // Update the payment to link it to the spend pool
  await tx.payment.update({
    where: { id: paymentId },
    data: {
      spendPoolId,
    },
  });

  // Update the total amount in the spend pool
  await tx.spendPool.update({
    where: { id: spendPoolId },
    data: {
      totalPaid: {
        increment: amount,
      },
    },
  });
}

/**
 * Update spend pool balance from a payment within an existing transaction
 * @param tx - The database transaction
 * @param echoAppId - The app ID to create/fund the spend pool for
 * @param paymentRecord - The payment record
 * @param amountInCents - The payment amount in cents
 * @param metadata - Payment metadata containing pool configuration
 */
export async function updateSpendPoolFromPayment(
  tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0],
  echoAppId: string,
  paymentRecord: Payment,
  amountInCents: number,
  metadata: Record<string, string>
): Promise<void> {
  // Get or create the free tier spend pool for this app
  const spendPool = await getOrCreateFreeTierSpendPoolInternal(
    tx,
    echoAppId,
    metadata?.poolName
  );

  // Fund the spend pool with this payment
  await fundSpendPoolInternal(
    tx,
    spendPool.id,
    paymentRecord.id,
    amountInCents / 100 // Convert from cents to dollars
  );

  console.log(
    `Free tier pool ${spendPool.id} funded with $${amountInCents / 100} from payment ${paymentRecord.id}`
  );

  // Set default spend limit if provided
  if (metadata?.defaultSpendLimit) {
    const defaultLimit = parseFloat(metadata.defaultSpendLimit);
    if (!isNaN(defaultLimit) && defaultLimit > 0) {
      // This will be applied to users when they access the app
      console.log(
        `Default spend limit of $${defaultLimit} will be applied to new users for pool ${spendPool.id}`
      );
    }
  }
}

/**
 * Internal function to get or create a free tier spend pool within an existing transaction
 */
async function getOrCreateFreeTierSpendPoolInternal(
  tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0],
  appId: string,
  poolName?: string
): Promise<SpendPool> {
  // First try to find an existing free tier pool
  let spendPool = await tx.spendPool.findFirst({
    where: {
      echoAppId: appId,
      name: {
        contains: 'Free Tier',
      },
      isArchived: false,
    },
  });

  // If no free tier pool exists, create one
  if (!spendPool) {
    spendPool = await tx.spendPool.create({
      data: {
        name:
          poolName ||
          `Free Tier Credits - ${new Date().toISOString().split('T')[0]}`,
        description: 'Free tier credits pool for app users',
        totalPaid: 0, // Will be funded by payments
        echoAppId: appId,
      },
    });
  }

  return spendPool;
}
