import { getAuthenticatedUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/generated/prisma';
import { bulkGetAllUserAccessibleApps } from '@/lib/echo-apps';

// GET /api/v1/apps - List all Echo apps for the authenticated user
export async function GET(req: NextRequest) {
  try {
    let user: User;
    try {
      const { user: userResult } = await getAuthenticatedUser(req);
      user = userResult;
    } catch (error) {
      console.error('Error fetching apps:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const apps = await bulkGetAllUserAccessibleApps(user.id);

    return NextResponse.json({ apps });
  } catch (error) {
    console.error('Error fetching Echo apps:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required', details: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
