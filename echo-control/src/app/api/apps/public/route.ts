import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getAppActivity,
  transformActivityToChartData,
} from '@/lib/echo-apps/activity/activity';

// GET /api/apps/public - List all publicly available Echo apps
export async function GET() {
  try {
    const publicApps = await db.echoApp.findMany({
      where: {
        isPublic: true,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        profilePictureUrl: true,
        bannerImageUrl: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        authorizedCallbackUrls: true,
        _count: {
          select: {
            apiKeys: {
              where: { isArchived: false },
            },
            transactions: {
              where: { isArchived: false },
            },
          },
        },
        appMemberships: {
          where: {
            role: 'owner',
            status: 'active',
            isArchived: false,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get transaction stats and activity data for each app
    const appsWithStats = await Promise.all(
      publicApps.map(async app => {
        const [transactionStats, revenueStats, activity] = await Promise.all([
          db.transaction.aggregate({
            where: {
              echoAppId: app.id,
              isArchived: false,
            },
            _sum: {
              totalTokens: true,
              cost: true,
            },
          }),
          db.revenue.aggregate({
            where: {
              echoAppId: app.id,
              isArchived: false,
            },
            _sum: {
              amount: true,
            },
          }),
          getAppActivity(app.id).catch(error => {
            console.error(`Failed to fetch activity for app ${app.id}:`, error);
            return [];
          }),
        ]);

        const activityData = transformActivityToChartData(activity);
        const owner = app.appMemberships[0]?.user;

        return {
          id: app.id,
          name: app.name,
          description: app.description,
          profilePictureUrl: app.profilePictureUrl,
          bannerImageUrl: app.bannerImageUrl,
          isPublic: app.isPublic,
          createdAt: app.createdAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
          authorizedCallbackUrls: app.authorizedCallbackUrls,
          totalTokens: transactionStats._sum.totalTokens || 0,
          totalCost: Number(revenueStats._sum.amount || 0), // Use revenue instead of transaction cost
          _count: {
            apiKeys: app._count.apiKeys,
            transactions: app._count.transactions,
          },
          owner: {
            id: owner.id,
            name: owner.name,
            email: owner.email,
            profilePictureUrl: owner.profilePictureUrl,
          },
          activityData,
        };
      })
    );

    return NextResponse.json({ apps: appsWithStats });
  } catch (error) {
    console.error('Error fetching public Echo apps:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
