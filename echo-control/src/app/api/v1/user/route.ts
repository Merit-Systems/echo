import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { User } from '@/generated/prisma';
import { formatUserForApiResponse } from '@/lib/user';

// GET /api/v1/user - Get authenticated user information
export async function GET(request: NextRequest) {
  try {
    let user: User;
    try {
      const { user: userResult } = await getAuthenticatedUser(request);
      user = userResult;
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const responseData = formatUserForApiResponse(user);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching user info:', error);

    if (
      error instanceof Error &&
      (error.message === 'Not authenticated' ||
        error.message.includes('Invalid'))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
