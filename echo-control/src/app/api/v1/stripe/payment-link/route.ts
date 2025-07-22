import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createPaymentLink } from '@/lib/stripe/payment-link';
import Stripe from 'stripe';
import { User } from '@/generated/prisma';

// POST /api/v1/stripe/payment-link - Generate real Stripe payment link for authenticated user
export async function POST(request: NextRequest) {
  try {
    let user: User;
    try {
      const { user: userResult } = await getAuthenticatedUser(request);
      user = userResult;
    } catch (error) {
      console.error('Error creating payment link:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

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
