import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserSubscriptionService } from '@/lib/subscriptions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: appId } = await params;

    const subscriptions = await UserSubscriptionService.getUserSubscriptions(
      userId,
      appId
    );

    return NextResponse.json({
      subscriptions,
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: appId } = await params;
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');
    const cancelImmediately = searchParams.get('immediate') === 'true';

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const result = await UserSubscriptionService.cancelSubscription(
      userId,
      appId,
      subscriptionId,
      cancelImmediately
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: appId } = await params;
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');
    const action = searchParams.get('action');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    if (action === 'reactivate') {
      const result = await UserSubscriptionService.reactivateSubscription(
        userId,
        appId,
        subscriptionId
      );

      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
