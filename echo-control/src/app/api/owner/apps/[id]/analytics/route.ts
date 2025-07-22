import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';

// GET /api/owner/apps/[id]/analytics - Get analytics for app owners
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    const user = await getCurrentUser();

    // Check if user has permission to view analytics
    const hasPermission = await PermissionService.hasPermission(
      user.id,
      appId,
      Permission.VIEW_ANALYTICS
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Get all users who have used this app (API keys + transactions)
    const apiKeyUsers = await db.apiKey.findMany({
      where: {
        echoAppId: appId,
        isArchived: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const transactionUsers = await db.transaction.findMany({
      where: {
        echoAppId: appId,
        isArchived: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Merge and deduplicate users
    const allUsersMap = new Map();

    // Add API key users
    apiKeyUsers.forEach(apiKey => {
      if (!allUsersMap.has(apiKey.user.id)) {
        allUsersMap.set(apiKey.user.id, {
          id: apiKey.user.id,
          email: apiKey.user.email,
          name: apiKey.user.name,
          apiKeyCount: 0,
          totalSpent: 0,
        });
      }
      allUsersMap.get(apiKey.user.id).apiKeyCount++;
    });

    // Add transaction data
    transactionUsers.forEach(transaction => {
      if (!allUsersMap.has(transaction.user.id)) {
        allUsersMap.set(transaction.user.id, {
          id: transaction.user.id,
          email: transaction.user.email,
          name: transaction.user.name,
          apiKeyCount: 0,
          totalSpent: 0,
        });
      }
      allUsersMap.get(transaction.user.id).totalSpent += Number(
        transaction.cost
      );
    });

    // Get aggregate spending per user
    const userSpending = await db.transaction.groupBy({
      by: ['userId'],
      where: {
        echoAppId: appId,
        isArchived: false,
      },
      _sum: {
        cost: true,
      },
    });

    // Update total spent for each user
    userSpending.forEach(spending => {
      if (allUsersMap.has(spending.userId)) {
        allUsersMap.get(spending.userId).totalSpent = Number(
          spending._sum.cost || 0
        );
      }
    });

    // Get total API keys count
    const totalApiKeys = await db.apiKey.count({
      where: {
        echoAppId: appId,
        isArchived: false,
      },
    });

    // Get total spending for the app
    const totalSpending = await db.transaction.aggregate({
      where: {
        echoAppId: appId,
        isArchived: false,
      },
      _sum: {
        cost: true,
      },
    });

    const topUsers = Array.from(allUsersMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const analytics = {
      totalUsers: allUsersMap.size,
      totalApiKeys,
      totalSpent: Number(totalSpending._sum.cost || 0),
      topUsers,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching app analytics:', error);

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

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
