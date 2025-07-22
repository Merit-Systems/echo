import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { StripeWebhookService } from '@/lib/subscriptions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// POST /api/stripe/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Received webhook: ${event.type}`);
    console.log('Webhook Details: ', event.data);

    // Handle events using the new webhook service
    const handledEvents = [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'invoice.payment_succeeded',
      'invoice.paid',
      'invoice.payment_failed',
      'invoice.payment_action_required',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ];

    if (handledEvents.includes(event.type)) {
      try {
        await StripeWebhookService.processWebhookEvent(event);
        return NextResponse.json({ received: true });
      } catch (webhookError) {
        console.error('Webhook processing failed:', webhookError);
        // For critical events, we might want to return an error to trigger retry
        if (
          event.type.includes('subscription') ||
          event.type.includes('invoice')
        ) {
          return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
          );
        }
        // For non-critical events, log but continue
        console.log(
          'Continuing despite webhook processing error for event:',
          event.type
        );
      }
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
