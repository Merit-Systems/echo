import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getBalance } from '@/lib/balance';
import { Balance } from '@/lib/types/apps';

// GET /api/balance - Get authenticated user balance (optionally for a specific app)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const echoAppId = searchParams.get('echoAppId');

    const balanceResult = await getBalance(user, echoAppId);

    // Convert BalanceResult to Balance format expected by UI
    const balance: Balance = {
      balance: balanceResult.balance.toString(),
      totalPaid: balanceResult.totalPaid.toString(),
      totalSpent: balanceResult.totalSpent.toString(),
      currency: balanceResult.currency,
    };

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);

    if (
      error instanceof Error &&
      (error.message === 'Not authenticated' ||
        error.message.includes('Invalid') ||
        error.message === 'App membership not found')
    ) {
      const status = error.message === 'App membership not found' ? 404 : 401;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
