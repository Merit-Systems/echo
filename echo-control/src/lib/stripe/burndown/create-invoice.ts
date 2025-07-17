import Stripe from 'stripe';
import { User, Payment } from '@/generated/prisma';
import { getOrCreateCustomer } from '../customer';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'test_secret_stripe_key',
  {
    apiVersion: '2025-05-28.basil',
  }
);

export interface CreateInvoiceRequest {
  amountInCents: number;
  description?: string;
  successUrl?: string;
}

export interface CreateInvoiceResult {
  invoice: Stripe.Invoice;
  paymentLink: string;
}

export async function createInvoice(
  user: User,
  request: CreateInvoiceRequest
): Promise<CreateInvoiceResult> {
  const { amountInCents, description = 'Echo Credits', successUrl } = request;

  const customer = await getOrCreateCustomer(user.id);

  // Create a draft invoice first
  const invoice = await stripe.invoices.create({
    description: description,
    customer: customer.id,
    collection_method: 'charge_automatically',
    pending_invoice_items_behavior: 'exclude', // Don't add other pending invoiceItems to the invoice, do this explicitly
  });

  // Add the specific invoice item to the draft invoice
  await stripe.invoiceItems.create({
    customer: customer.id,
    currency: 'usd',
    unit_amount_decimal: amountInCents.toString(),
    invoice: invoice.id, // Explicitly attach to this invoice
  });

  if (!invoice.id) {
    throw new Error('Failed to create invoice');
  }

  // Finalize the invoice and auto-advance to charge it
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {
    auto_advance: true,
  });

  if (!finalizedInvoice.hosted_invoice_url) {
    throw new Error('Failed to create payment link');
  }

  return {
    invoice: finalizedInvoice,
    paymentLink: finalizedInvoice.hosted_invoice_url,
  };
}
