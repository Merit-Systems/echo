import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  handlePaymentSuccess,
  processPaymentUpdate,
  PaymentStatus,
} from '@/lib/payment-processing';
import Stripe from 'stripe';
import { logger } from '@/logger';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'test_secret_stripe_key',
  {
    apiVersion: '2025-05-28.basil',
  }
);

const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET || 'test_webhook_secret';

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
      logger.emit({
        severityText: 'ERROR',
        body: 'Webhook signature verification failed',
        attributes: {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        },
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    logger.emit({
      severityText: 'INFO',
      body: 'Received Stripe webhook',
      attributes: {
        eventType: event.type,
        eventId: event.id,
      },
    });

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
        logger.emit({
          severityText: 'WARN',
          body: 'Unhandled Stripe webhook event type',
          attributes: {
            eventType: event.type,
            eventId: event.id,
          },
        });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Webhook handler failed',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
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
      logger.emit({
        severityText: 'ERROR',
        body: 'Missing userId or amount in checkout session metadata',
        attributes: {
          sessionId: session.id,
          userId,
          amount_total,
          handler: 'handleCheckoutSessionCompleted',
        },
      });
      return;
    }

    // Determine the payment ID to update based on whether this is from a payment link
    let paymentId: string;
    if (payment_link) {
      // This checkout session was created from a payment link
      paymentId = payment_link as string;
      logger.emit({
        severityText: 'INFO',
        body: 'Checkout session completed from payment link',
        attributes: {
          paymentId,
          sessionId: session.id,
          handler: 'handleCheckoutSessionCompleted',
        },
      });
    } else if (payment_intent) {
      // This is a direct checkout session
      paymentId = session.id;
      logger.emit({
        severityText: 'INFO',
        body: 'Direct checkout session completed',
        attributes: {
          paymentId,
          sessionId: session.id,
          handler: 'handleCheckoutSessionCompleted',
        },
      });
    } else {
      logger.emit({
        severityText: 'ERROR',
        body: 'No payment_link or payment_intent found in checkout session',
        attributes: {
          sessionId: session.id,
          handler: 'handleCheckoutSessionCompleted',
        },
      });
      return;
    }

    // Use a database transaction to atomically update payment status and user balance
    await db.$transaction(async tx => {
      // Update payment in database
      const updatedPayment = await tx.payment.findMany({
        where: {
          paymentId: paymentId,
          status: PaymentStatus.PENDING,
        },
      });

      let paymentRecord;
      if (updatedPayment.length === 0) {
        logger.emit({
          severityText: 'WARN',
          body: 'No pending payment found for payment ID, creating new record',
          attributes: {
            paymentId,
            handler: 'handleCheckoutSessionCompleted',
          },
        });
        // Create a new payment record if one doesn't exist
        paymentRecord = await tx.payment.create({
          data: {
            paymentId: paymentId,
            amount: amount_total,
            currency: currency || 'usd',
            status: PaymentStatus.COMPLETED,
            description: description || 'Echo credits purchase',
            userId,
          },
        });
        logger.emit({
          severityText: 'INFO',
          body: 'Created new payment record',
          attributes: {
            paymentId,
            userId,
            handler: 'handleCheckoutSessionCompleted',
          },
        });
      } else {
        // Get the existing payment record
        paymentRecord = await tx.payment.update({
          where: {
            paymentId: paymentId,
          },
          data: {
            status: PaymentStatus.COMPLETED,
          },
        });
      }

      // Process the payment update using the cleaned up payment processing logic
      if (paymentRecord) {
        await processPaymentUpdate(tx, {
          userId,
          amountInCents: amount_total,
          paymentRecord,
          metadata: metadata || {},
          echoAppId,
        });
      }
    });

    const creditsAdded = Math.floor(amount_total / 100);
    const isFreeTier = metadata?.type === 'free-tier-credits';
    logger.emit({
      severityText: 'INFO',
      body: 'Checkout completed successfully',
      attributes: {
        userId,
        echoAppId,
        creditsAdded,
        isFreeTier,
        handler: 'handleCheckoutSessionCompleted',
      },
    });
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error handling checkout completion',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        handler: 'handleCheckoutSessionCompleted',
      },
    });
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { id } = paymentIntent;

    await db.payment.updateMany({
      where: { paymentId: id },
      data: { status: PaymentStatus.FAILED },
    });

    logger.emit({
      severityText: 'WARN',
      body: 'Payment failed',
      attributes: {
        paymentIntentId: id,
        handler: 'handlePaymentFailure',
      },
    });
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error handling payment failure',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        handler: 'handlePaymentFailure',
      },
    });
  }
}

async function handleInvoicePayment(invoice: Stripe.Invoice) {
  try {
    const { id, amount_paid, currency } = invoice;

    // Handle recurring payments if needed
    logger.emit({
      severityText: 'INFO',
      body: 'Invoice payment received',
      attributes: {
        invoiceId: id,
        amount_paid,
        currency,
        handler: 'handleInvoicePayment',
      },
    });
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error handling invoice payment',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        handler: 'handleInvoicePayment',
      },
    });
  }
}
