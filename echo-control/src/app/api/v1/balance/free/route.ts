import { getCustomerSpendInfoForApp } from '@/lib/spend-pools/fetch-user-spend';
import { getAuthenticatedUser } from '@/lib/auth';
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import type { User } from '@/generated/prisma';

// POST /api/v1/balance/free - Get authenticated user's free tier spend info for a specific app
export async function POST(request: NextRequest) {
  try {
    let user: User;
    try {
      const { user: userResult } = await getAuthenticatedUser(request);
      user = userResult;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { echoAppId } = await request.json();

    if (!echoAppId) {
      return NextResponse.json(
        { error: 'echoAppId is required' },
        { status: 400 }
      );
    }

    const { spendPoolBalance, userSpendInfo } =
      await getCustomerSpendInfoForApp(user.id, echoAppId);

    return NextResponse.json({
      spendPoolBalance,
      userSpendInfo,
    });
  } catch (error) {
    console.error('Error fetching customer spend info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
