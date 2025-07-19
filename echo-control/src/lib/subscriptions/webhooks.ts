import Stripe from 'stripe';
import { db } from '@/lib/db';

/**
 * Webhook service for handling Stripe events with proper separation between
 * subscription events and payment link events.
 */
export class StripeWebhookService {
  /**
   * Main entry point for processing webhook events.
   * Routes events to appropriate handlers based on event type and context.
   */
  static async processWebhookEvent(event: Stripe.Event): Promise<void> {
    console.log(`🎯 Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        // Checkout session events - need context-aware routing
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session
          );
          break;

        // Payment intent events - check for subscription context
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent
          );
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(
            event.data.object as Stripe.PaymentIntent
          );
          break;

        // Invoice events - subscription-specific
        case 'invoice.payment_succeeded':
          await SubscriptionHandler.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice
          );
          break;

        case 'invoice.paid':
          await SubscriptionHandler.handleInvoicePaid(
            event.data.object as Stripe.Invoice
          );
          break;

        case 'invoice.payment_failed':
          await SubscriptionHandler.handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice
          );
          break;

        case 'invoice.payment_action_required':
          await SubscriptionHandler.handleInvoicePaymentActionRequired(
            event.data.object as Stripe.Invoice
          );
          break;

        // Subscription lifecycle events
        case 'customer.subscription.updated':
          await SubscriptionHandler.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription
          );
          break;

        case 'customer.subscription.deleted':
          await SubscriptionHandler.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription
          );
          break;

        default:
          console.log(`📝 Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`❌ Error processing webhook event ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Context-aware handler for checkout session completion.
   * Routes to subscription or payment link handlers based on session mode and metadata.
   */
  private static async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    console.log('🎯 Handling checkout session completed:', session.id);

    // Determine the context based on session mode and metadata
    if (session.mode === 'subscription') {
      await SubscriptionHandler.handleCheckoutSessionCompleted(session);
    } else if (session.mode === 'payment' || session.payment_link) {
      await PaymentLinkHandler.handleCheckoutSessionCompleted(session);
    } else {
      console.log('❓ Unknown checkout session mode:', session.mode);
      // Default to payment link handling for backwards compatibility
      await PaymentLinkHandler.handleCheckoutSessionCompleted(session);
    }
  }

  /**
   * Context-aware handler for payment intent success.
   * Routes based on metadata and associated objects.
   */
  private static async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    console.log('💳 Handling payment intent succeeded:', paymentIntent.id);

    // Check if this is subscription-related
    if (this.isSubscriptionRelated(paymentIntent.metadata)) {
      await SubscriptionHandler.handlePaymentIntentSucceeded(paymentIntent);
    } else {
      await PaymentLinkHandler.handlePaymentIntentSucceeded(paymentIntent);
    }
  }

  /**
   * Context-aware handler for payment intent failure.
   */
  private static async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    console.log('❌ Handling payment intent failed:', paymentIntent.id);

    if (this.isSubscriptionRelated(paymentIntent.metadata)) {
      await SubscriptionHandler.handlePaymentIntentFailed(paymentIntent);
    } else {
      await PaymentLinkHandler.handlePaymentIntentFailed(paymentIntent);
    }
  }

  /**
   * Determines if an event is subscription-related based on metadata.
   */
  private static isSubscriptionRelated(
    metadata: { [key: string]: string } | null
  ): boolean {
    if (!metadata) return false;

    // Check for subscription-specific metadata
    return !!(metadata.subscriptionId || metadata.stripeSubscriptionId);
  }
}

/**
 * Handles subscription-specific webhook events.
 */
class SubscriptionHandler {
  static async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    console.log(
      '🔄 Handling subscription checkout session completed:',
      session.id
    );

    const subscriptionId = session.metadata?.subscriptionId;
    const stripeSubscriptionId = session.subscription as string;

    if (!subscriptionId || !stripeSubscriptionId) {
      console.log('❌ Missing subscription IDs in checkout session metadata');
      return;
    }

    // Update subscription status and link Stripe subscription ID
    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        stripeSubscriptionId: stripeSubscriptionId,
        isActive: true,
        status: 'active',
        updatedAt: new Date(),
      },
    });

    console.log('✅ Updated subscription after checkout:', subscriptionId);
  }

  static async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    console.log('💳 Handling subscription payment success:', paymentIntent.id);

    const subscriptionId = paymentIntent.metadata?.subscriptionId;
    if (subscriptionId) {
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          isActive: true,
          status: 'active',
          updatedAt: new Date(),
        },
      });
      console.log(
        '✅ Updated subscription from payment intent:',
        subscriptionId
      );
    }
  }

  static async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    console.log('❌ Handling subscription payment failure:', paymentIntent.id);

    const subscriptionId = paymentIntent.metadata?.subscriptionId;
    if (subscriptionId) {
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          isActive: false,
          status: 'incomplete',
          updatedAt: new Date(),
        },
      });
      console.log('❌ Updated subscription status to failed:', subscriptionId);
    }
  }

  static async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice
  ): Promise<void> {
    console.log(
      '📄 Handling subscription invoice payment succeeded:',
      invoice.id
    );

    const stripeSubscriptionId = (invoice as any).subscription as string;
    if (!stripeSubscriptionId) return;

    const subscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          isActive: true,
          status: 'active',
          updatedAt: new Date(),
        },
      });
      console.log(
        '✅ Updated subscription from invoice payment:',
        subscription.id
      );
    }
  }

  static async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    console.log('💰 Handling subscription invoice paid:', invoice.id);

    const stripeSubscriptionId = (invoice as any).subscription as string;
    if (!stripeSubscriptionId) return;

    const subscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          isActive: true,
          status: 'active',
          updatedAt: new Date(),
        },
      });
      console.log(
        '✅ Provisioned subscription access from invoice paid:',
        subscription.id
      );
    }
  }

  static async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice
  ): Promise<void> {
    console.log('❌ Handling subscription invoice payment failed:', invoice.id);

    const stripeSubscriptionId = (invoice as any).subscription as string;
    if (!stripeSubscriptionId) return;

    const subscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          isActive: false,
          status: 'past_due',
          updatedAt: new Date(),
        },
      });
      console.log(
        '❌ Deactivated subscription due to failed payment:',
        subscription.id
      );
    }
  }

  static async handleInvoicePaymentActionRequired(
    invoice: Stripe.Invoice
  ): Promise<void> {
    console.log(
      '⚠️ Handling subscription invoice payment action required:',
      invoice.id
    );

    const stripeSubscriptionId = (invoice as any).subscription as string;
    if (!stripeSubscriptionId) return;

    const subscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          isActive: false,
          status: 'incomplete',
          updatedAt: new Date(),
        },
      });
      console.log(
        '⚠️ Suspended subscription pending payment action:',
        subscription.id
      );
    }
  }

  static async handleSubscriptionUpdated(
    subscription: Stripe.Subscription
  ): Promise<void> {
    console.log('🔄 Handling subscription updated:', subscription.id);

    const dbSubscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (dbSubscription) {
      const subscriptionData = subscription as any;
      await db.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: subscription.status,
          currentPeriodStart: subscriptionData.current_period_start
            ? new Date(subscriptionData.current_period_start * 1000)
            : null,
          currentPeriodEnd: subscriptionData.current_period_end
            ? new Date(subscriptionData.current_period_end * 1000)
            : null,
          isActive: ['active', 'trialing'].includes(subscription.status),
          updatedAt: new Date(),
        },
      });

      console.log('✅ Updated subscription details:', {
        id: dbSubscription.id,
        status: subscription.status,
        isActive: ['active', 'trialing'].includes(subscription.status),
      });
    }
  }

  static async handleSubscriptionDeleted(
    subscription: Stripe.Subscription
  ): Promise<void> {
    console.log('🗑️ Handling subscription deleted:', subscription.id);

    const dbSubscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (dbSubscription) {
      await db.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'canceled',
          isActive: false,
          isArchived: true,
          updatedAt: new Date(),
        },
      });

      console.log('✅ Marked subscription as deleted:', dbSubscription.id);
    }
  }
}

/**
 * Handles payment link-specific webhook events.
 */
class PaymentLinkHandler {
  static async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    console.log(
      '💳 Handling payment link checkout session completed:',
      session.id
    );

    const { metadata, amount_total, currency, payment_link, payment_intent } =
      session;
    const userId = metadata?.userId;
    const echoAppId = metadata?.echoAppId;
    const description = metadata?.description;

    if (!userId || !amount_total) {
      console.error('Missing userId or amount in session metadata');
      return;
    }

    // Determine the payment ID based on payment link or session
    let paymentId: string;
    if (payment_link) {
      paymentId = payment_link as string;
      console.log(`Payment link checkout completed: ${paymentId}`);
    } else if (payment_intent) {
      paymentId = session.id;
      console.log(`Direct checkout session completed: ${paymentId}`);
    } else {
      console.error(
        'No payment_link or payment_intent found in checkout session'
      );
      return;
    }

    // Update payment and user balance atomically
    await db.$transaction(async tx => {
      // Update or create payment record
      const updatedPayment = await tx.payment.updateMany({
        where: {
          stripePaymentId: paymentId,
          status: 'pending',
        },
        data: {
          status: 'completed',
          updatedAt: new Date(),
        },
      });

      if (updatedPayment.count === 0) {
        console.log(`Creating new payment record for: ${paymentId}`);
        await tx.payment.create({
          data: {
            stripePaymentId: paymentId,
            amount: amount_total,
            currency: currency || 'usd',
            status: 'completed',
            description: description || 'Echo credits purchase',
            userId,
          },
        });
      }

      // Update user's total paid amount
      await tx.user.update({
        where: { id: userId },
        data: {
          totalPaid: {
            increment: amount_total / 100, // Convert cents to dollars
          },
        },
      });
    });

    const creditsAdded = Math.floor(amount_total / 100);
    console.log(
      `✅ Payment link completed for user ${userId}: ${creditsAdded} credits added`
    );
  }

  static async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    console.log(
      '💳 Handling payment link payment intent succeeded:',
      paymentIntent.id
    );

    const { id, amount, currency, metadata } = paymentIntent;
    const userId = metadata?.userId;

    if (!userId) {
      console.error('No userId in payment metadata');
      return;
    }

    await db.$transaction(async tx => {
      // Update or create payment record
      await tx.payment.upsert({
        where: { stripePaymentId: id },
        update: {
          status: 'completed',
          updatedAt: new Date(),
        },
        create: {
          stripePaymentId: id,
          amount,
          currency,
          status: 'completed',
          description: 'Echo credits purchase',
          userId,
        },
      });

      // Update user's total paid
      await tx.user.update({
        where: { id: userId },
        data: {
          totalPaid: {
            increment: amount / 100, // Convert cents to dollars
          },
        },
      });
    });

    console.log(`✅ Payment link payment succeeded: ${id}`);
  }

  static async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    console.log(
      '❌ Handling payment link payment intent failed:',
      paymentIntent.id
    );

    await db.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: {
        status: 'failed',
        updatedAt: new Date(),
      },
    });

    console.log(`❌ Payment link payment failed: ${paymentIntent.id}`);
  }
}

// For backwards compatibility, expose the main service as the original name
export const SubscriptionWebhookService = StripeWebhookService;
