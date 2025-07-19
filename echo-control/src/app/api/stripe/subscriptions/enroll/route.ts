import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { SubscriptionEnrollmentService } from '@/lib/subscriptions';

// POST /api/stripe/subscriptions/enroll - Enroll a customer in a subscription
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { type, id, appId } = body;

    // Validate required fields
    if (!type || !id || !appId) {
      return NextResponse.json(
        { error: 'Type, ID, and App ID are required' },
        { status: 400 }
      );
    }

    const result = await SubscriptionEnrollmentService.enrollUser(
      user.id,
      user.email,
      user.name,
      user.clerkId,
      { type, id, appId }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating subscription:', error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
