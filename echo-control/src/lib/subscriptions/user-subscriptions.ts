import Stripe from 'stripe';
import { db } from '@/lib/db';
import { UserSubscription } from './types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export class UserSubscriptionService {
  /**
   * Get user's active subscriptions for a specific app
   */
  static async getUserSubscriptions(
    clerkUserId: string,
    appId: string
  ): Promise<UserSubscription[]> {
    console.log('🔍 Fetching subscriptions for:', { clerkUserId, appId });

    // Fetch user's active subscriptions for this app
    const subscriptions = await db.subscription.findMany({
      where: {
        echoAppId: appId,
        user: {
          clerkId: clerkUserId,
        },
        isArchived: false,
        status: {
          in: ['active', 'trialing'], // Active or in trial period
        },
      },
      include: {
        subscriptionPackage: {
          include: {
            subscriptionPackageProducts: {
              include: {
                product: true,
              },
            },
          },
        },
        subscriptionProducts: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(
      `📊 Found ${subscriptions.length} active subscriptions for user ${clerkUserId} in app ${appId}`
    );

    if (subscriptions.length === 0) {
      // Let's also check for ANY subscriptions (regardless of active status) for this user/app
      const allUserSubscriptions = await db.subscription.findMany({
        where: {
          echoAppId: appId,
          user: {
            clerkId: clerkUserId,
          },
        },
        select: {
          id: true,
          stripeSubscriptionId: true,
          status: true,
          isArchived: true,
          createdAt: true,
        },
      });
      console.log(
        'All subscriptions for this user/app (regardless of status):',
        allUserSubscriptions
      );
    }

    // Transform the data for easier frontend consumption
    return subscriptions.map(sub => ({
      id: sub.id,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      createdAt: sub.createdAt,
      type: sub.subscriptionPackageId ? 'package' : 'product',
      package: sub.subscriptionPackage
        ? {
            id: sub.subscriptionPackage.id,
            name: sub.subscriptionPackage.name,
            description: sub.subscriptionPackage.description || undefined,
            createdAt: sub.subscriptionPackage.createdAt.toISOString(),
            updatedAt: sub.subscriptionPackage.updatedAt.toISOString(),
            products: sub.subscriptionPackage.subscriptionPackageProducts.map(
              spp => ({
                id: spp.product.id,
                name: spp.product.name,
                description: spp.product.description || undefined,
                stripeProductId: spp.product.stripeProductId,
                stripePriceId: spp.product.stripePriceId,
                price: Number(spp.product.price),
                currency: spp.product.currency,
                createdAt: spp.product.createdAt.toISOString(),
                updatedAt: spp.product.updatedAt.toISOString(),
              })
            ),
            totalPrice:
              sub.subscriptionPackage.subscriptionPackageProducts.reduce(
                (sum, spp) => sum + Number(spp.product.price),
                0
              ),
          }
        : null,
      products: sub.subscriptionProducts.map(sp => ({
        id: sp.product.id,
        name: sp.product.name,
        description: sp.product.description || undefined,
        stripeProductId: sp.product.stripeProductId,
        stripePriceId: sp.product.stripePriceId,
        price: Number(sp.product.price),
        currency: sp.product.currency,
        createdAt: sp.product.createdAt.toISOString(),
        updatedAt: sp.product.updatedAt.toISOString(),
      })),
    })) as UserSubscription[];
  }

  /**
   * Check if user has access to specific products through their subscriptions
   */
  static async userHasProductAccess(
    clerkUserId: string,
    appId: string,
    productIds: string[]
  ): Promise<boolean> {
    const subscriptions = await this.getUserSubscriptions(clerkUserId, appId);

    const userProductIds = new Set<string>();

    // Collect all product IDs the user has access to through their subscriptions
    subscriptions.forEach(subscription => {
      // Add individual products
      subscription.products.forEach(product => {
        userProductIds.add(product.id);
      });

      // Add package products
      if (subscription.package) {
        subscription.package.products.forEach(product => {
          userProductIds.add(product.id);
        });
      }
    });

    // Check if user has access to all requested products
    return productIds.every(productId => userProductIds.has(productId));
  }

  /**
   * Get all products a user has access to through their subscriptions
   */
  static async getUserAccessibleProducts(
    clerkUserId: string,
    appId: string
  ): Promise<string[]> {
    const subscriptions = await this.getUserSubscriptions(clerkUserId, appId);

    const userProductIds = new Set<string>();

    subscriptions.forEach(subscription => {
      // Add individual products
      subscription.products.forEach(product => {
        userProductIds.add(product.id);
      });

      // Add package products
      if (subscription.package) {
        subscription.package.products.forEach(product => {
          userProductIds.add(product.id);
        });
      }
    });

    return Array.from(userProductIds);
  }

  /**
   * Cancel a user's subscription
   */
  static async cancelSubscription(
    clerkUserId: string,
    appId: string,
    subscriptionId: string,
    cancelImmediately = false
  ): Promise<{ success: boolean; message: string }> {
    console.log('🚫 Cancelling subscription:', {
      clerkUserId,
      appId,
      subscriptionId,
      cancelImmediately,
    });

    // Find the subscription
    const subscription = await db.subscription.findFirst({
      where: {
        id: subscriptionId,
        echoAppId: appId,
        user: {
          clerkId: clerkUserId,
        },
        isArchived: false,
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found or already cancelled',
      };
    }

    try {
      // Cancel the Stripe subscription
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: !cancelImmediately,
          ...(cancelImmediately && {
            cancel_at: Math.floor(Date.now() / 1000),
          }),
        }
      );

      // Update the database
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: stripeSubscription.status,
          updatedAt: new Date(),
        },
      });

      console.log('✅ Subscription cancelled successfully:', {
        subscriptionId,
        stripeStatus: stripeSubscription.status,
        cancelImmediately,
        cancelAt: stripeSubscription.cancel_at,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      });

      const message = cancelImmediately
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of the current billing period';

      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('❌ Error cancelling subscription:', error);
      return {
        success: false,
        message: 'Failed to cancel subscription. Please try again.',
      };
    }
  }

  /**
   * Reactivate a cancelled subscription (if still within the current period)
   */
  static async reactivateSubscription(
    clerkUserId: string,
    appId: string,
    subscriptionId: string
  ): Promise<{ success: boolean; message: string }> {
    console.log('🔄 Reactivating subscription:', {
      clerkUserId,
      appId,
      subscriptionId,
    });

    // Find the subscription
    const subscription = await db.subscription.findFirst({
      where: {
        id: subscriptionId,
        echoAppId: appId,
        user: {
          clerkId: clerkUserId,
        },
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
      };
    }

    try {
      // Check the current Stripe subscription status
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      // Only allow reactivation if subscription is set to cancel at period end
      if (!stripeSubscription.cancel_at_period_end) {
        return {
          success: false,
          message: 'Subscription is not scheduled for cancellation',
        };
      }

      // Reactivate by removing the cancellation
      const updatedStripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: false,
        }
      );

      // Update the database
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: updatedStripeSubscription.status,
          updatedAt: new Date(),
        },
      });

      console.log('✅ Subscription reactivated successfully:', {
        subscriptionId,
        stripeStatus: updatedStripeSubscription.status,
      });

      return {
        success: true,
        message: 'Subscription has been reactivated',
      };
    } catch (error) {
      console.error('❌ Error reactivating subscription:', error);
      return {
        success: false,
        message: 'Failed to reactivate subscription. Please try again.',
      };
    }
  }
}
