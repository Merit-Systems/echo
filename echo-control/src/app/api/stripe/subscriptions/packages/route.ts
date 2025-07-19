import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { SubscriptionPackageService } from '@/lib/subscriptions';

// POST /api/stripe/subscriptions/packages - Create a subscription package that groups multiple products
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { appId, name, description, productIds } = body;

    // Validate required fields
    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    const result = await SubscriptionPackageService.createPackage(user.id, {
      appId,
      name,
      description,
      productIds,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription package:', error);

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

// GET /api/stripe/subscriptions/packages?appId=<appId> - Get all subscription packages for an app
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    // Validate required fields
    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    const packages = await SubscriptionPackageService.getAppPackages(
      user.id,
      appId
    );

    return NextResponse.json({
      packages,
    });
  } catch (error) {
    console.error('Error fetching subscription packages:', error);

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
