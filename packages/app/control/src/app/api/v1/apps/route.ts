import { getAuthenticatedUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getAllOwnerEchoApps } from '@/lib/apps/owner';
import { User } from '@/generated/prisma';
import { logger } from '@/logger';

// GET /api/v1/apps - List all Echo apps for the authenticated user
export async function GET(req: NextRequest) {
  try {
    let user: User;
    try {
      const { user: userResult } = await getAuthenticatedUser(req);
      user = userResult;
    } catch (error) {
      logger.emit({
        severityText: 'ERROR',
        body: 'Error fetching user for apps endpoint',
        attributes: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const apps = await getAllOwnerEchoApps(user.id);

    logger.emit({
      severityText: 'INFO',
      body: 'Successfully fetched Echo apps',
      attributes: {
        userId: user.id,
        appCount: apps.length,
      },
    });

    return NextResponse.json({ apps });
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error fetching Echo apps',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('authentication')) {
      logger.emit({
        severityText: 'WARN',
        body: 'Authentication error in v1 apps endpoint',
        attributes: {
          error: error.message,
        },
      });
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
