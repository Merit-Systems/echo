import z from 'zod';

import { stripe } from '../client';

import { createPayment } from '@/services/db/payments/create';

import { logger } from '@/logger';

import { PaymentStatus } from '@/types/payments';

import type Stripe from 'stripe';

const createPaymentLinkSchema = z.object({
  amount: z.number().min(1),
  name: z.string(),
  description: z.string(),
  successUrl: z.url(),
  metadata: z.custom<Stripe.MetadataParam>().optional(),
});

export const createPaymentLink = async (
  userId: string,
  parameters: z.infer<typeof createPaymentLinkSchema>
) => {
  if (!stripe) {
    throw new Error('Stripe is not configured for this environment');
  }

  const { amount, name, description, successUrl, metadata } =
    createPaymentLinkSchema.parse(parameters);

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

  const product = await stripe.products.create({
    name,
    description,
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

  const price = await stripe.prices.create({
    unit_amount: Math.round(amount * 100),
    currency: 'usd',
    product: product.id,
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata,
    after_completion: {
      type: 'redirect',
      redirect: {
        url: successUrl,
      },
    },
  });

  // Create pending payment record
  const payment = await createPayment({
    paymentId: paymentLink.id,
    amount: amount,
    currency: 'usd',
    status: PaymentStatus.PENDING,
    description: description,
    userId,
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
};
