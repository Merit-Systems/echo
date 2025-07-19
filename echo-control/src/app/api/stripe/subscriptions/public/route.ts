import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionProductService } from '@/lib/subscriptions';

// GET /api/stripe/subscriptions/public?appId=<appId> - Get available products for an app (public access for customers)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    // Validate required fields
    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    const products = await SubscriptionProductService.getPublicProducts(appId);

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error('Error fetching public products:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
