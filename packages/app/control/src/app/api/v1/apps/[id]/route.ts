import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { EchoApp, User } from '@/generated/prisma';
import { getApp } from '@/lib/apps/get-app';
import { logger } from '@/logger';

// GET /api/v1/apps/[id] - Get detailed app information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let user: User;
    let echoApp: EchoApp;
    try {
      const { user: userResult, echoApp: echoAppResult } =
        await getAuthenticatedUser(request);
      user = userResult;
      echoApp = echoAppResult;
    } catch (error) {
      logger.emit({
        severityText: 'WARN',
        body: 'Authentication failed for app request',
        attributes: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id: appId } = resolvedParams;

    if (echoApp && echoApp.id !== appId) {
      logger.emit({
        severityText: 'WARN',
        body: 'Access denied: User trying to access different app',
        attributes: {
          requestedAppId: appId,
          userAppId: echoApp.id,
          userId: user.id,
        },
      });
      return NextResponse.json(
        { error: 'Access denied: App not found' },
        { status: 403 }
      );
    }

    const appWithStats = await getApp(appId, user.id);

    logger.emit({
      severityText: 'INFO',
      body: 'Successfully retrieved app details',
      attributes: {
        appId,
        userId: user.id,
      },
    });

    return NextResponse.json(appWithStats);
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error fetching echo app',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    if (
      error instanceof Error &&
      (error.message === 'Not authenticated' ||
        error.message.includes('Invalid'))
    ) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message.includes('not found or access denied')
    ) {
      return NextResponse.json(
        { error: 'Echo app not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
