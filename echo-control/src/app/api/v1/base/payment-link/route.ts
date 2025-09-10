import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getCurrentUser } from '@/lib/auth';
import type { User } from '@/generated/prisma';
import {
  handlePaymentSuccessFromx402,
  formatAmountFromQueryParams,
} from '@/lib/base';

// GET /api/v1/base/payment-link - Create base payment link
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    let user: User;
    try {
      const { user: userResult } = await getAuthenticatedUser(request);
      user = userResult;
    } catch (error) {
      console.error('Error authenticating user:', error);
      try {
        const userResult = await getCurrentUser();
        user = userResult;
      } catch (error) {
        console.log('Error getting current user:', error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const amount = formatAmountFromQueryParams(request);

    if (!amount) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const normalizedCentsAmount = amount * 100;

    handlePaymentSuccessFromx402({
      userId: user.id,
      amount: normalizedCentsAmount,
      currency: 'usd',
      metadata: {},
    });

    return NextResponse.json(
      { message: 'Payment created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payment link:', error);

    // Handle authentication errors
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add specific error handling for your use case
    // Example:
    // if (error instanceof SpecificError) {
    //   return NextResponse.json(
    //     { error: error.message },
    //     { status: 400 }
    //   );
    // }

    // Generic server error fallback
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = GET;
