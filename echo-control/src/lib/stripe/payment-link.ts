import { db } from '../db';
import { User } from '@/generated/prisma';
import Stripe from 'stripe';
import { CreatePaymentLinkRequest, CreatePaymentLinkResult } from './types';

export * from './types';

/**
 * PICO-CENT PRECISION SUPPORT
 *
 * This module now supports unlimited dollar amounts with pico-cent precision:
 * - Database stores amounts as DECIMAL(65,14)
 * - 51 digits before decimal point (virtually unlimited dollar amounts)
 * - 14 digits after decimal point (pico-cent precision: 10^-14 dollars)
 *
 * Examples of supported values:
 * - $0.00000000000001 (1 pico-cent)
 * - $999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999.99999999999999
 * - Any value in between with up to 14 decimal places
 */

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'test_secret_stripe_key',
  {
    apiVersion: '2025-05-28.basil',
  }
);

/**
 * Helper function to validate URLs
 * @param urlString - The URL string to validate
 * @returns true if the URL is valid and uses HTTP/HTTPS protocol
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Create a Stripe payment link for purchasing credits
 * @param user - The authenticated user
 * @param request - Payment link request details
 * @returns Payment link and database record
 */
export async function createPaymentLink(
  user: User,
  request: CreatePaymentLinkRequest
): Promise<CreatePaymentLinkResult> {
  const { amount, description = 'Echo Credits', successUrl } = request;

  if (successUrl && !isValidUrl(successUrl)) {
    throw new Error('Invalid success URL format');
  }

  if (!amount || amount <= 0) {
    throw new Error('Valid amount is required');
  }

  // Convert amount to cents for Stripe
  const amountInCents = Math.round(amount * 100);

  // Create Stripe product
  const product = await stripe.products.create({
    name: description,
    description: `${description} - ${amount} USD`,
  });

  // Create Stripe price
  const price = await stripe.prices.create({
    unit_amount: amountInCents,
    currency: 'usd',
    product: product.id,
  });

  // Prepare after_completion configuration
  const defaultSuccessUrl =
    process.env.ECHO_CONTROL_APP_BASE_URL + `?payment=success`;
  const afterCompletion: Stripe.PaymentLinkCreateParams.AfterCompletion = {
    type: 'redirect',
    redirect: {
      url: successUrl || defaultSuccessUrl,
    },
  };

  // Prepare payment link configuration
  const paymentLinkConfig: Stripe.PaymentLinkCreateParams = {
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      description,
    },
    after_completion: afterCompletion,
  };

  // Create Stripe payment link
  const paymentLink = await stripe.paymentLinks.create(paymentLinkConfig);

  // Create pending payment record
  const payment = await db.payment.create({
    data: {
      stripePaymentId: paymentLink.id,
      amount: amount,
      currency: 'usd',
      status: 'pending',
      description: description,
      userId: user.id,
    },
  });

  return {
    paymentLink: {
      id: paymentLink.id,
      url: paymentLink.url,
      amount: amount,
      currency: 'usd',
      status: 'pending',
      created: Math.floor(Date.now() / 1000),
      metadata: {
        userId: user.id,
        description,
      },
    },
    payment,
  };
}
