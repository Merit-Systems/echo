import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createPaymentLink, isValidUrl } from '@/lib/stripe/payment-link';
import Stripe from 'stripe';

// POST /api/stripe/payment-link - Generate real Stripe payment link for authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    // Validate callback URLs if provided
    if (body.successUrl && !isValidUrl(body.successUrl)) {
      return NextResponse.json(
        { error: 'Invalid success URL format' },
        { status: 400 }
      );
    }

    // Validate app_free_pool payment destination
    if (body.paymentDestination === 'app_free_pool' && !body.echoAppId) {
      return NextResponse.json(
        {
          error:
            'echoAppId is required when paymentDestination is app_free_pool',
        },
        { status: 400 }
      );
    }

    const result = await createPaymentLink(user, body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating payment link:', error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === 'Valid amount is required'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
