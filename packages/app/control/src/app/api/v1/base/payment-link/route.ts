import { NextResponse } from 'next/server';
import { handlePaymentSuccessFromx402 } from '@/lib/base';
import z from 'zod';
import { authRoute } from '../../_lib/auth-route';

const querySchema = z.object({
  amount: z.number().positive(),
});

export const GET = authRoute.query(querySchema).handler(async (_, context) => {
  const { amount } = context.query;

  const normalizedCentsAmount = amount * 100;

  handlePaymentSuccessFromx402({
    userId: context.ctx.userId,
    amount: normalizedCentsAmount,
    currency: 'usd',
    metadata: {},
  });

  return NextResponse.json(
    { message: 'Payment created successfully' },
    { status: 201 }
  );
});

export const POST = GET;
