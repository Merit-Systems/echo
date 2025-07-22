import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';

// GET /api/owner/apps/[id]/users - List all app users with pagination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    // Check if user has permission to manage customers
    const hasPermission = await PermissionService.hasPermission(
      user.id,
      appId,
      Permission.MANAGE_CUSTOMERS
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Optional pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get all app users (all roles) with pagination
    const users = await db.appMembership.findMany({
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
            profilePictureUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await db.appMembership.count({
      where: {
        echoAppId: appId,
        isArchived: false,
      },
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Get API key counts and total spending for each user
    const usersWithStats = await Promise.all(
      users.map(async membership => {
        const [apiKeyCount, totalSpentResult] = await Promise.all([
          db.apiKey.count({
            where: {
              userId: membership.userId,
              echoAppId: appId,
              isArchived: false,
            },
          }),
          db.transaction.aggregate({
            where: {
              userId: membership.userId,
              echoAppId: appId,
              isArchived: false,
            },
            _sum: {
              cost: true,
            },
          }),
        ]);

        return {
          id: membership.id,
          userId: membership.user.id,
          email: membership.user.email,
          name: membership.user.name,
          profilePictureUrl: membership.user.profilePictureUrl,
          role: membership.role,
          status: membership.status,
          totalSpent: Number(membership.totalSpent),
          apiKeyCount,
          transactionSpent: Number(totalSpentResult._sum.cost || 0),
          joinedAt: membership.createdAt.toISOString(),
          userCreatedAt: membership.user.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching app users:', error);

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
