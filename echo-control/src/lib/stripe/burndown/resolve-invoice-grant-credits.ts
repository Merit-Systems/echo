import { db } from '@/lib/db';
import Stripe from 'stripe';
import { CreditGrant } from '@/generated/prisma';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'test_secret_stripe_key',
  {
    apiVersion: '2025-05-28.basil',
  }
);

const CREDIT_GRANT_EXPIRATION_TIME_SECONDS = 3600 * 24 * 365; // 1 Year

export async function resolveInvoiceGrantCredits(
  invoiceId: string,
  customerId: string
): Promise<CreditGrant> {
  const invoice = await stripe.invoices.retrieve(invoiceId);

  if (!invoice.id) {
    throw new Error('Invoice not found');
  }

  const creditGrant = await stripe.billing.creditGrants.create({
    customer: customerId,
    category: 'paid',
    amount: {
      type: 'monetary',
      monetary: {
        value: invoice.amount_due,
        currency: 'usd',
      },
    },
    applicability_config: {
      scope: {
        price_type: 'metered',
      },
    },
    expires_at:
      Math.floor(Date.now() / 1000) + CREDIT_GRANT_EXPIRATION_TIME_SECONDS, // 1 Year from now
  });

  // Write to database that the user has received credits to the CreditGrants Table
  const creditGrantRecord = await db.creditGrant.create({
    data: {
      stripeCreditGrantId: creditGrant.id,
      stripeCustomerId: customerId,
      stripeInvoiceId: invoiceId,
      amount: invoice.amount_due,
      currency: invoice.currency || 'usd',
      category: 'paid',
      expiresAt: creditGrant.expires_at
        ? new Date(creditGrant.expires_at * 1000)
        : null,
    },
  });

  return creditGrantRecord;
}
