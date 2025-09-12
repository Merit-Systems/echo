import z from 'zod';

import { db } from '@/lib/db';
import { processPaymentUpdate, PaymentStatus } from '@/lib/payment-processing';

import { EnumPaymentSource, type Prisma } from '@/generated/prisma';
import { logger } from '@/logger';

export const mintCreditsToUserSchema = z.object({
  userId: z.uuid(),
  amountInDollars: z.number().min(0.01),
  options: z
    .object({
      isFreeTier: z.boolean().optional(),
      echoAppId: z.string().optional(),
      metadata: z.record(z.string(), z.string()).optional(),
      poolName: z.string().optional(),
      defaultSpendLimit: z.number().positive().optional(),
      description: z.string().optional(),
      source: z.nativeEnum(EnumPaymentSource),
    })
    .refine(
      data => {
        return !(data.isFreeTier && !data.echoAppId);
      },
      {
        message: 'echoAppId is required for free tier credit minting',
      }
    ),
});

export const mintCreditsToUser = async (
  input: z.infer<typeof mintCreditsToUserSchema>,
  tx?: Prisma.TransactionClient
) => {
  tx = tx || db;

  const result = mintCreditsToUserSchema.safeParse(input);

  if (!result.success) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Invalid input for credit minting',
      attributes: {
        validationError: result.error.message,
        input: JSON.stringify(input),
        function: 'mintCreditsToUser',
      },
    });
    throw new Error(result.error.message, { cause: result.error });
  }

  const { userId, amountInDollars, options } = result.data;

  const {
    isFreeTier = false,
    echoAppId,
    metadata = {},
    poolName,
    defaultSpendLimit,
    description = options.isFreeTier
      ? 'Free-Tier Credit Redemption Payment'
      : 'Personal Balance Credit Redemption Payment',
    source,
  } = options;

  // Convert dollars to cents for storage
  const amountInCents = Math.round(amountInDollars * 100);

  // Generate a unique payment ID for tracking
  const paymentId = `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create payment record
  const paymentRecord = await tx.payment.create({
    data: {
      paymentId: paymentId,
      amount: amountInDollars,
      currency: 'usd',
      status: PaymentStatus.COMPLETED,
      source: source,
      description,
      userId,
    },
  });

  await processPaymentUpdate(tx, {
    userId,
    amountInCents,
    paymentRecord,
    metadata: {
      ...metadata,
      type: isFreeTier ? 'free-tier-credits' : 'admin-issued',
      mintedAt: new Date().toISOString(),
      ...(poolName && { poolName }),
      ...(defaultSpendLimit && {
        defaultSpendLimit: defaultSpendLimit.toString(),
      }),
    },
    echoAppId: isFreeTier ? echoAppId : undefined,
  });

  logger.emit({
    severityText: 'INFO',
    body: 'Successfully minted credits to user',
    attributes: {
      userId,
      amountInDollars,
      amountInCents,
      isFreeTier,
      echoAppId,
      paymentId,
      poolName,
      function: 'mintCreditsToUser',
    },
  });

  return {
    userId,
    amountInDollars,
    echoAppId,
    isFreeTier,
  };
};
