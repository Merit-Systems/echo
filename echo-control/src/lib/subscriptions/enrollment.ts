import Stripe from 'stripe';
import { db } from '@/lib/db';
import { EnrollSubscriptionRequest, SubscriptionCreateResponse } from './types';
import { Product, SubscriptionPackage } from '@/generated/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export class SubscriptionEnrollmentService {
  /**
   * Enroll a user in a subscription (product or package)
   */
  static async enrollUser(
    userId: string,
    userEmail: string,
    userName: string | null,
    userClerkId: string,
    request: EnrollSubscriptionRequest
  ): Promise<SubscriptionCreateResponse> {
    const { type, id, appId } = request;

    if (type !== 'product' && type !== 'package') {
      throw new Error('Type must be either "product" or "package"');
    }

    // Verify the app exists and is active
    const app = await db.echoApp.findUnique({
      where: { id: appId },
      select: { id: true, name: true },
    });

    if (!app) {
      throw new Error('App not found or inactive');
    }

    // Check if user is already a member of this app
    const membership = await db.appMembership.findUnique({
      where: {
        userId_echoAppId: {
          userId: userId,
          echoAppId: appId,
        },
      },
    });

    if (!membership) {
      throw new Error('You must be a member of this app to subscribe');
    }

    let subscriptionItems: { price: string }[] = [];
    let dbProducts: Product[] = [];
    let subscriptionPackageToUse: SubscriptionPackage | null = null;

    if (type === 'package') {
      // Handle package subscription
      const subscriptionPackage = await db.subscriptionPackage.findUnique({
        where: { id },
        include: {
          subscriptionPackageProducts: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!subscriptionPackage || subscriptionPackage.echoAppId !== appId) {
        throw new Error('Subscription package not found');
      }

      if (subscriptionPackage.isArchived) {
        throw new Error('Subscription package is not available');
      }

      subscriptionPackageToUse = subscriptionPackage;
      dbProducts = subscriptionPackage.subscriptionPackageProducts.map(
        spp => spp.product
      );
      subscriptionItems = dbProducts.map(product => ({
        price: product.stripePriceId,
      }));
    } else {
      // Handle individual product subscription
      const product = await db.product.findUnique({
        where: { id },
      });

      if (!product || product.echoAppId !== appId) {
        throw new Error('Product not found');
      }

      if (product.isArchived) {
        throw new Error('Product is not available');
      }

      dbProducts = [product];
      subscriptionItems = [
        {
          price: product.stripePriceId,
        },
      ];
    }

    // Get or create Stripe customer
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    let stripeCustomerId = user?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        name: userName || undefined,
        metadata: {
          userId: userId,
          clerkId: userClerkId,
        },
      });

      stripeCustomerId = customer.id;

      // Update user record with Stripe customer ID
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: subscriptionItems,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId,
        appId: appId,
        appName: app.name,
        subscriptionType: type,
        subscriptionId: id,
        packageId: subscriptionPackageToUse?.id || '',
      },
    });

    // Store subscription in database
    const dbSubscription = await db.subscription.create({
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId,
        status: subscription.status,
        currentPeriodStart: (
          subscription as unknown as { current_period_start?: number }
        ).current_period_start
          ? new Date(
              (subscription as unknown as { current_period_start: number })
                .current_period_start * 1000
            )
          : null,
        currentPeriodEnd: (
          subscription as unknown as { current_period_end?: number }
        ).current_period_end
          ? new Date(
              (subscription as unknown as { current_period_end: number })
                .current_period_end * 1000
            )
          : null,
        userId: userId,
        echoAppId: appId,
        subscriptionPackageId: subscriptionPackageToUse?.id || null,
      },
    });

    console.log('✅ Created subscription in database:', {
      dbSubscriptionId: dbSubscription.id,
      stripeSubscriptionId: subscription.id,
      userId: userId,
      appId,
      status: subscription.status,
      stripeCustomerId,
      subscriptionPackageId: subscriptionPackageToUse?.id || null,
    });

    // Create subscription product links
    for (const product of dbProducts) {
      await db.subscriptionProduct.create({
        data: {
          subscriptionId: dbSubscription.id,
          productId: product.id,
        },
      });
    }

    // Get payment URL
    const paymentUrl = await this.getPaymentUrl(
      subscription,
      stripeCustomerId,
      appId,
      dbSubscription.id,
      userId
    );

    return {
      success: true,
      subscriptionId: dbSubscription.id,
      stripeSubscriptionId: subscription.id,
      paymentUrl,
      message: 'Subscription created successfully',
    };
  }

  /**
   * Get payment URL for a subscription
   */
  private static async getPaymentUrl(
    subscription: Stripe.Subscription,
    stripeCustomerId: string,
    appId: string,
    dbSubscriptionId: string,
    userId: string
  ): Promise<string> {
    // Get payment link from the subscription
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    let paymentUrl = '';

    if (
      invoice &&
      (invoice as unknown as { payment_intent?: Stripe.PaymentIntent })
        .payment_intent
    ) {
      const paymentIntent = (
        invoice as unknown as { payment_intent: Stripe.PaymentIntent }
      ).payment_intent;
      if (paymentIntent.client_secret) {
        // For a more robust implementation, you might want to create a custom payment page
        // For now, we'll use the hosted invoice URL
        paymentUrl =
          (invoice as unknown as { hosted_invoice_url?: string })
            .hosted_invoice_url || '';
      }
    }

    if (!paymentUrl) {
      // Fallback: Create a checkout session
      const baseUrl =
        process.env.ECHO_CONTROL_APP_BASE_URL || 'http://localhost:3000';
      const successUrl = `${baseUrl}/apps/${appId}?payment=success`;
      const cancelUrl = `${baseUrl}/apps/${appId}`;

      const subscriptionItems = subscription.items.data.map(item => ({
        price: item.price.id,
        quantity: 1,
      }));

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: subscriptionItems,
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId,
          appId: appId,
          subscriptionId: dbSubscriptionId,
        },
      });

      paymentUrl = session.url || '';
    }

    return paymentUrl;
  }
}
