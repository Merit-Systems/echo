import type { NextRequest } from 'next/server';
import { db } from '../db';
import { processPaymentUpdate, PaymentStatus } from '../payment-processing';
import { logger } from '@/logger';

export const formatAmountFromQueryParams = (
  req: NextRequest
): number | null => {
  const formattedAmount = req.nextUrl.searchParams.get('amount') || '1';

  const amount = parseFloat(formattedAmount);

  if (isNaN(amount)) {
    return null;
  }

  return amount;
};

export const formatPriceForMiddleware = (amount: number): string => {
  return '$' + amount;
};

export async function handlePaymentSuccessFromx402({
  userId,
  amount,
  currency,
  metadata,
}: {
  userId: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}) {
  try {
    if (!userId) {
      logger.emit({
        severityText: 'ERROR',
        body: 'No userId in payment metadata',
        attributes: {
          function: 'handlePaymentSuccessFromx402',
        },
      });
      return;
    }

    const cryptoMetadata = {
      'payment-type': 'x402',
      'transaction-id': 'x402_' + crypto.randomUUID(),
      amount: amount.toString(),
      currency: currency,
      ...metadata,
    };

    // Use a database transaction to atomically update payment status and user balance
    await db.$transaction(async tx => {
      // Update payment in database
      const paymentRecord = await tx.payment.upsert({
        where: { paymentId: cryptoMetadata['transaction-id'] },
        update: { status: PaymentStatus.COMPLETED },
        create: {
          paymentId: cryptoMetadata['transaction-id'],
          amount,
          currency,
          status: PaymentStatus.COMPLETED,
          description: 'Echo credits purchase with x402',
          userId,
        },
      });

      // Process the payment update using the cleaned up payment processing logic
      await processPaymentUpdate(tx, {
        userId,
        amountInCents: amount,
        paymentRecord,
        metadata: cryptoMetadata || {},
        echoAppId: metadata?.echoAppId,
      });
    });

    const isFreeTier = metadata?.type === 'free-tier-credits';
    logger.emit({
      severityText: 'INFO',
      body: 'Payment succeeded',
      attributes: {
        transactionId: cryptoMetadata['transaction-id'],
        isFreeTier,
        userId,
        function: 'handlePaymentSuccessFromx402',
      },
    });
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error handling payment success',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        function: 'handlePaymentSuccessFromx402',
      },
    });
  }
}
