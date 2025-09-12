import { NextResponse } from 'next/server';
import { getUserGlobalBalance, getUserAppBalance } from '@/lib/balance';
import { logger } from '@/logger';
import { authRoute } from '../_lib/auth-route';
import { z } from 'zod';
import { appIdSchema } from '@/services/apps/lib/schemas';

const querySchema = z.object({ appId: appIdSchema.optional() });

export const GET = authRoute.query(querySchema).handler(async (_, context) => {
  const { appId } = context.query;
  if (appId) {
    try {
      const balance = await getUserAppBalance(context.ctx.userId, appId);

      logger.emit({
        severityText: 'INFO',
        body: 'Successfully fetched app-specific user balance',
        attributes: {
          userId: context.ctx.userId,
          appId,
          balance: balance.balance,
        },
      });

      return NextResponse.json(balance);
    } catch (error) {
      logger.emit({
        severityText: 'ERROR',
        body: 'Error fetching app-specific user balance',
        attributes: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          userId: context.ctx.userId,
          appId,
        },
      });
      return NextResponse.json(
        { message: 'Failed to fetch balance' },
        { status: 404 }
      );
    }
  } else {
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
  }
});
