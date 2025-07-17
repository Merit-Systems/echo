import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';
import { resolveInvoiceGrantCredits } from '@/lib/stripe/burndown/resolve-invoice-grant-credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// POST /api/stripe/webhook - Handle Stripe webhooks for basic payment
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

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePayment(event.data.object);
        break;
      default:
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

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const { metadata, amount_total, currency, payment_link, payment_intent } =
      session;
    const userId = metadata?.userId;
    const echoAppId = metadata?.echoAppId;
    const description = metadata?.description;

    if (!userId || !amount_total) {
      console.error('Missing userId or amount in session metadata');
      return;
    }

    // Determine the payment ID to update based on whether this is from a payment link
    let paymentId: string;
    if (payment_link) {
      // This checkout session was created from a payment link
      paymentId = payment_link as string;
      console.log(`Checkout session completed from payment link: ${paymentId}`);
    } else if (payment_intent) {
      // This is a direct checkout session
      paymentId = session.id;
      console.log(`Direct checkout session completed: ${paymentId}`);
    } else {
      console.error(
        'No payment_link or payment_intent found in checkout session'
      );
      return;
    }

    // Use a database transaction to atomically update payment status and user balance
    await db.$transaction(async tx => {
      // Update payment in database
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
        console.warn(`No pending payment found for payment ID: ${paymentId}`);
        // Create a new payment record if one doesn't exist
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
        console.log(`Created new payment record for payment ID: ${paymentId}`);
      }

      // Atomically update user's totalPaid (amount_total is in cents, convert to dollars)
      await tx.user.update({
        where: { id: userId },
        data: {
          totalPaid: {
            increment: amount_total / 100,
          },
        },
      });
    });

    const creditsAdded = Math.floor(amount_total / 100);
    console.log(
      `Checkout completed for user ${userId}${echoAppId ? ` and app ${echoAppId}` : ''}: ${creditsAdded} credits added, totalPaid updated`
    );
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { id, amount, currency, metadata } = paymentIntent;
    const userId = metadata?.userId;

    if (!userId) {
      console.error('No userId in payment metadata');
      return;
    }

    // Use a database transaction to atomically update payment status and user balance
    await db.$transaction(async tx => {
      // Update payment in database
      await tx.payment.upsert({
        where: { stripePaymentId: id },
        update: { status: 'completed' },
        create: {
          stripePaymentId: id,
          amount,
          currency,
          status: 'completed',
          description: 'Echo credits purchase',
          userId,
        },
      });

      // Atomically update user's totalPaid (amount is in cents, convert to dollars)
      await tx.user.update({
        where: { id: userId },
        data: {
          totalPaid: {
            increment: amount / 100,
          },
        },
      });
    });

    console.log(`Payment succeeded: ${id}, totalPaid updated`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { id } = paymentIntent;

    await db.payment.updateMany({
      where: { stripePaymentId: id },
      data: { status: 'failed' },
    });

    console.log(`Payment failed: ${id}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleInvoicePayment(invoice: Stripe.Invoice) {
  try {
    const { id, amount_paid, currency } = invoice;

    if (!invoice.id || !invoice.customer) {
      console.error('No invoice ID or customer found in invoice');
      return;
    }

    // Handle recurring payments if needed
    console.log(
      `Invoice payment received: ${id} for ${amount_paid} ${currency}`
    );

    // Resolve the invoice grant credits
    await resolveInvoiceGrantCredits(id!, invoice.customer as string);
  } catch (error) {
    console.error('Error handling invoice payment:', error);
  }
}
