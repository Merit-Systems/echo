import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { isValidUUID } from '@/lib/oauth-config/index';
import { findEchoApp } from '@/lib/echo-apps/index';
import { db } from '@/lib/db';
import { AppRole, PermissionService } from '@/lib/permissions';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/owner/apps/[id]/refresh-tokens - Check for active refresh tokens
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid app ID format' },
        { status: 400 }
      );
    }

    // Check if Echo app exists and user owns it
    const echoApp = await findEchoApp(id, user.id);

    if (!echoApp) {
      return NextResponse.json(
        { error: 'Echo app not found' },
        { status: 404 }
      );
    }

    // reject if the user is not an owner
    if (
      (await PermissionService.getUserAppRole(user.id, id)) !== AppRole.OWNER
    ) {
      return NextResponse.json(
        { error: 'User is not an owner' },
        { status: 403 }
      );
    }

    // Check for active refresh tokens for this app
    const activeTokens = await db.refreshToken.findMany({
      where: {
        echoAppId: id,
        isArchived: false,
        expiresAt: {
          gt: new Date(), // Only tokens that haven't expired
        },
      },
      take: 1, // We just need to know if any exist
    });

    const hasActiveTokens = activeTokens.length > 0;

    return NextResponse.json({
      hasActiveTokens,
      tokenCount: activeTokens.length,
      appId: id,
    });
  } catch (error) {
    console.error('Error checking refresh tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
