import { NextResponse } from 'next/server';
import { getUserGlobalBalance } from '@/services/user/balance';
import { logger } from '@/logger';
import { authRoute } from '../../../../lib/api/auth-route';

export const GET = authRoute.handler(async (_, context) => {
  try {
    const balance = await getUserGlobalBalance(context.ctx.userId);

    logger.emit({
      severityText: 'INFO',
      body: 'Successfully fetched global user balance',
      attributes: {
        userId: context.ctx.userId,
        balance: balance.balance,
      },
    });

    return NextResponse.json(balance);
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error fetching global user balance',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: context.ctx.userId,
      },
    });
    return NextResponse.json(
      { message: 'Failed to fetch balance' },
      { status: 404 }
    );
  }
});
