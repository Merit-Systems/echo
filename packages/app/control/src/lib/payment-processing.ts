import { updateSpendPoolFromPayment } from './spend-pools';
import { updateUserBalanceFromPayment } from './balance';
import type { Payment } from '@/generated/prisma';
import type { PrismaClient } from '@/generated/prisma';
import { db } from './db';
import type Stripe from 'stripe';
import { logger } from '@/logger';

interface PaymentProcessingData {
  userId: string;
  amountInCents: number;
  paymentRecord: Payment;
  metadata?: Record<string, string>;
  echoAppId?: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
/**
 * Process a payment by updating either free tier spend pools or user personal balance
 * @param tx - The database transaction
 * @param data - Payment processing data
 */
export async function processPaymentUpdate(
  tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0],
  data: PaymentProcessingData
): Promise<void> {
  const { userId, amountInCents, paymentRecord, metadata, echoAppId } = data;

  // Handle free tier pool creation and funding if this is a free tier payment
  if (metadata?.type === 'free-tier-credits' && echoAppId && paymentRecord) {
    await updateSpendPoolFromPayment(
      tx,
      echoAppId,
      paymentRecord,
      amountInCents,
      metadata
    );

    logger.emit({
      severityText: 'INFO',
      body: 'Free tier payment processed',
      attributes: {
        echoAppId,
        amountInCents,
        amountInDollars: amountInCents / 100,
        function: 'processPaymentUpdate',
      },
    });
  } else {
    // For non-free-tier payments, update user's totalPaid balance
    await updateUserBalanceFromPayment(tx, userId, amountInCents);

    logger.emit({
      severityText: 'INFO',
      body: 'Personal balance updated for user',
      attributes: {
        userId,
        amountInCents,
        amountInDollars: amountInCents / 100,
        function: 'processPaymentUpdate',
      },
    });
  }
}

export async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const { id, amount, currency, metadata } = paymentIntent;
    const userId = metadata?.userId;

    if (!userId) {
      console.error('No userId in payment metadata');
      return;
    }

    // Use a database transaction to atomically update payment status and user balance
    await db.$transaction(async tx => {
      // Update payment in database
      const paymentRecord = await tx.payment.upsert({
        where: { paymentId: id },
        update: { status: PaymentStatus.COMPLETED },
        create: {
          paymentId: id,
          amount,
          currency,
          status: PaymentStatus.COMPLETED,
          description: 'Echo credits purchase',
          userId,
        },
      });

      // Process the payment update using the cleaned up payment processing logic
      await processPaymentUpdate(tx, {
        userId,
        amountInCents: amount,
        paymentRecord,
        metadata: metadata || {},
        echoAppId: metadata?.echoAppId,
      });
    });

    const isFreeTier = metadata?.type === 'free-tier-credits';
    logger.emit({
      severityText: 'INFO',
      body: 'Payment succeeded',
      attributes: {
        paymentIntentId: id,
        isFreeTier,
        function: 'handlePaymentSuccess',
      },
    });
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error handling payment success',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        paymentIntentId: paymentIntent.id,
        function: 'handlePaymentSuccess',
      },
    });
  }
}
