import Stripe from 'stripe';

import { NextResponse } from 'next/server';

import { createPaymentLink, createPaymentLinkSchema } from '@/services/stripe';

import { authRoute } from '../../../../../lib/api/auth-route';

export const POST = authRoute
  .body(createPaymentLinkSchema)
  .handler(async (_, context) => {
    try {
      const result = await createPaymentLink(context.ctx.userId, context.body);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        return NextResponse.json(
          { message: `Stripe error: ${error.message}` },
          { status: 400 }
        );
      }
      if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  });
