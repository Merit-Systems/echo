import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionPackageService } from '@/lib/subscriptions';

// GET /api/stripe/subscriptions/packages/public?appId=<appId> - Get available packages for an app (public access for customers)
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

    const packages = await SubscriptionPackageService.getPublicPackages(appId);

    return NextResponse.json({
      packages,
    });
  } catch (error) {
    console.error('Error fetching public subscription packages:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
