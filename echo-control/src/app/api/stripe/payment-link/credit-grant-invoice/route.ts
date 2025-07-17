import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createInvoice,
  CreateInvoiceRequest,
} from '@/lib/stripe/burndown/create-invoice';
import Stripe from 'stripe';
import { isValidUrl } from '@/lib/stripe/payment-link';

// POST /api/stripe/payment-link/credit-grant-invoice - Generate Stripe invoice payment link for credit grant
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const { amountInCents, description, successUrl }: CreateInvoiceRequest =
      body;

    // Validate required parameters
    if (
      !amountInCents ||
      typeof amountInCents !== 'number' ||
      amountInCents <= 0
    ) {
      return NextResponse.json(
        { error: 'Valid amountInCents is required and must be positive' },
        { status: 400 }
      );
    }

    // Validate success URL if provided
    if (successUrl && !isValidUrl(successUrl)) {
      return NextResponse.json(
        { error: 'Invalid success URL format' },
        { status: 400 }
      );
    }

    const result = await createInvoice(user, {
      amountInCents,
      description: description || 'Echo Credits',
      successUrl,
    });

    return NextResponse.json(
      {
        paymentLink: result.paymentLink,
        invoiceId: result.invoice.id,
        amount: amountInCents,
        description: description || 'Echo Credits',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating credit grant invoice:', error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: 'Stripe error: ' + error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
