import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { SubscriptionProductService } from '@/lib/subscriptions';

// POST /api/stripe/subscriptions/products - Create a Product Offering and Price for an App. Can only be invoked by App Owner.
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { appId, name, description, price } = body;

    // Validate required fields
    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    const result = await SubscriptionProductService.createProduct(user.id, {
      appId,
      name,
      description,
      price,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating Stripe product and price:', error);

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
// GET /api/stripe/subscriptions - Get products for an app (owner only)
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

    const products = await SubscriptionProductService.getAppProducts(
      user.id,
      appId
    );

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);

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

// Create a subscription for an App. Can only be invoked by App Owner
// export function createSubscriptionRoute();

// Generate Invoice + Payment Link for the user to pay for the subscription
// Adds user to the subscription in Stripe
// The subscription will immediately Require Payment
// export function addUserToSubscriptionRoute();

// Webhook from Stripe will update the validity of the subscription, if the user has paid or not.
// If a subscription is paid, this will entitle the user to the products that the subscription is linked to
// export function updateSubscriptionValidityRoute();
