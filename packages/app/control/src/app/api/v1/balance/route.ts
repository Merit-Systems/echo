import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserGlobalBalance, getUserAppBalance } from '@/lib/balance';
import { User } from '@/generated/prisma';
import { logger } from '@/logger';

// GET /api/v1/balance - Get authenticated user balance (optionally for a specific app)
export async function GET(request: NextRequest) {
  let user: User;
  try {
    const { user: userResult } = await getAuthenticatedUser(request);
    user = userResult;
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error fetching user for balance endpoint',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const echoAppId = request.nextUrl.searchParams.get('echoAppId');

  if (!echoAppId) {
    try {
      const balance = await getUserGlobalBalance(user.id);

      logger.emit({
        severityText: 'INFO',
        body: 'Successfully fetched global user balance',
        attributes: {
          userId: user.id,
          balance: balance.balance,
        },
      });

      return NextResponse.json(balance);
    } catch (error) {
      logger.emit({
        severityText: 'ERROR',
        body: 'Error fetching global balance',
        attributes: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          userId: user.id,
        },
      });
      return NextResponse.json(
        { error: 'Failed to fetch balance' },
        { status: 500 }
      );
    }
  }

  try {
    const balanceResult = await getUserAppBalance(user.id, echoAppId);

    logger.emit({
      severityText: 'INFO',
      body: 'Successfully fetched app-specific user balance',
      attributes: {
        userId: user.id,
        echoAppId,
        balance: balanceResult.balance,
      },
    });

    return NextResponse.json(balanceResult);
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error fetching app-specific balance',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: user.id,
        echoAppId,
      },
    });

    if (
      error instanceof Error &&
      (error.message === 'Not authenticated' ||
        error.message.includes('Invalid') ||
        error.message === 'App membership not found')
    ) {
      const status = error.message === 'App membership not found' ? 404 : 401;
      logger.emit({
        severityText: 'WARN',
        body: 'Authentication or membership error in balance endpoint',
        attributes: {
          error: error.message,
          userId: user.id,
          echoAppId,
          status,
        },
      });
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
