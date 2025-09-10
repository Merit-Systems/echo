import Stripe from 'stripe';

import { z } from 'zod';

import { db } from '@/lib/db';
import { PaymentStatus } from '@/lib/payment-processing';
import { logger } from '@/logger';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? 'test_secret_stripe_key',
  {
    apiVersion: '2025-05-28.basil',
  }
);

export const createPaymentLinkSchema = z.object({
  amount: z.number().min(1),
  description: z.string().optional(),
  successUrl: z.url().optional(),
});

export async function createPaymentLink(
  userId: string,
  {
    amount,
    description = 'Echo Credits',
    successUrl,
  }: z.infer<typeof createPaymentLinkSchema>
) {
  if (amount <= 0) {
    logger.emit({
      severityText: 'WARN',
      body: 'Invalid amount for payment link creation',
      attributes: {
        userId,
        amount,
        function: 'createPaymentLink',
      },
    });
    throw new Error('Valid amount is required');
  }

  logger.emit({
    severityText: 'INFO',
    body: 'Creating Stripe payment link',
    attributes: {
      userId,
      amount,
      description,
      function: 'createPaymentLink',
    },
  });

  // Create Stripe product
  const product = await stripe.products.create({
    name: description,
    description: `${description} - ${amount} USD`,
  });

  logger.emit({
    severityText: 'DEBUG',
    body: 'Created Stripe product',
    attributes: {
      productId: product.id,
      productName: product.name,
      userId,
      function: 'createPaymentLink',
    },
  });

  // Create Stripe price
  const amountInCents = Math.round(amount * 100);
  const price = await stripe.prices.create({
    unit_amount: amountInCents,
    currency: 'usd',
    product: product.id,
  });

  // Prepare payment link configuration
  const paymentLinkConfig: Stripe.PaymentLinkCreateParams = {
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      description,
    },
    after_completion: {
      type: 'redirect',
      redirect: {
        url:
          successUrl ??
          `${process.env.ECHO_CONTROL_APP_BASE_URL}/credits?payment=success`,
      },
    },
  };

  // Create Stripe payment link
  const paymentLink = await stripe.paymentLinks.create(paymentLinkConfig);

  // Create pending payment record
  const payment = await db.payment.create({
    data: {
      paymentId: paymentLink.id,
      amount: amount,
      currency: 'usd',
      status: PaymentStatus.PENDING,
      description: description,
      userId,
    },
  });

  return {
    paymentLink: {
      id: paymentLink.id,
      url: paymentLink.url,
      amount: amount,
      currency: 'usd',
      status: PaymentStatus.PENDING,
      created: Math.floor(Date.now() / 1000),
      metadata: {
        userId,
        description,
      },
    },
    payment,
  };
}

export const createFreeTierPaymentLinkSchema = createPaymentLinkSchema.extend({
  appId: z.string(),
  poolName: z.string().optional(),
  defaultSpendLimit: z.number().optional(),
});

/**
 * Create a Stripe payment link for free tier credits pool
 * @param user - The authenticated user (app owner)
 * @param appId - The app ID to create the free tier pool for
 * @param request - Payment link request details
 * @returns Payment link and database record
 */
export async function createFreeTierPaymentLink(
  userId: string,
  {
    amount,
    description = 'Free Tier Credits Pool',
    successUrl,
    poolName,
    defaultSpendLimit,
    appId,
  }: z.infer<typeof createFreeTierPaymentLinkSchema>
) {
  if (amount <= 0) {
    throw new Error('Valid amount is required');
  }

  // Verify the app exists and user has access
  const app = await db.echoApp.findFirst({
    where: {
      id: appId,
      isArchived: false,
    },
    include: {
      appMemberships: {
        where: {
          userId,
          role: 'owner',
          status: 'active',
          isArchived: false,
        },
      },
    },
  });

  if (!app || app.appMemberships.length === 0) {
    throw new Error('App not found');
  }

  // Convert amount to cents for Stripe
  const amountInCents = Math.round(amount * 100);

  // Create Stripe product
  const product = await stripe.products.create({
    name: `${description} - ${app.name}`,
    description: `${description} for ${app.name} - ${amount} USD`,
  });

  // Create Stripe price
  const price = await stripe.prices.create({
    unit_amount: amountInCents,
    currency: 'usd',
    product: product.id,
  });

  // Prepare after_completion configuration
  const defaultSuccessUrl =
    process.env.ECHO_CONTROL_APP_BASE_URL +
    `/owner/${appId}/settings?payment=success&type=free-tier`;
  const afterCompletion: Stripe.PaymentLinkCreateParams.AfterCompletion = {
    type: 'redirect',
    redirect: {
      url: successUrl ?? defaultSuccessUrl,
    },
  };

  // Prepare payment link configuration with app metadata
  const paymentLinkConfig: Stripe.PaymentLinkCreateParams = {
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      echoAppId: appId,
      description,
      type: 'free-tier-credits',
      poolName:
        poolName ??
        `Free Tier Credits - ${new Date().toISOString().split('T')[0]}`,
      defaultSpendLimit: defaultSpendLimit?.toString() ?? '100',
    },
    after_completion: afterCompletion,
  };

  // Create Stripe payment link
  const paymentLink = await stripe.paymentLinks.create(paymentLinkConfig);

  // Create pending payment record
  const payment = await db.payment.create({
    data: {
      paymentId: paymentLink.id,
      amount: amount,
      currency: 'usd',
      status: PaymentStatus.PENDING,
      description: description,
      userId,
    },
  });

  return {
    paymentLink: {
      id: paymentLink.id,
      url: paymentLink.url,
      amount: amount,
      currency: 'usd',
      status: PaymentStatus.PENDING,
      created: Math.floor(Date.now() / 1000),
      metadata: {
        userId,
        description,
      },
    },
    payment,
  };
}
