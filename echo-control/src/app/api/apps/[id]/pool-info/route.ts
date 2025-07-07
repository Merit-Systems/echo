import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/apps/[id]/pool-info - Get app pool information
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id: appId } = await params;

    // Check if user has permission to view analytics (owner/admin only)
    const hasPermission = await PermissionService.hasPermission(
      user.id,
      appId,
      Permission.VIEW_ANALYTICS
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get app with pool information
    const app = await db.echoApp.findUnique({
      where: {
        id: appId,
        isArchived: false,
      },
      select: {
        freeSpendPoolAmount: true,
        maxPerUserPoolSpendAmount: true,
        appMemberships: {
          select: {
            freeSpendPoolSpent: true,
          },
        },
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // Calculate total pool spent (sum of all memberships' freeSpendPoolSpent)
    const totalPoolSpent = app.appMemberships.reduce(
      (sum, membership) => sum + Number(membership.freeSpendPoolSpent),
      0
    );

    const poolInfo = {
      freeSpendPoolAmount: Number(app.freeSpendPoolAmount),
      maxPerUserPoolSpendAmount: Number(app.maxPerUserPoolSpendAmount),
      totalPoolSpent,
    };

    return NextResponse.json(poolInfo);
  } catch (error) {
    console.error('Error fetching app pool info:', error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
