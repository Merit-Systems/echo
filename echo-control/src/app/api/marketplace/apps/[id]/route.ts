import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/marketplace/apps/[id] - Get detailed app info for marketplace
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    const user = await getCurrentUser();

    // Get detailed app information
    const app = await db.echoApp.findFirst({
      where: {
        id: appId,
        isActive: true,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        markUp: true,
        githubId: true,
        githubType: true,
        // Marketplace customization fields
        marketplaceName: true,
        marketplaceDescription: true,
        marketplaceImageUrl: true,
        marketplaceUrl: true,
        _count: {
          select: {
            appMemberships: {
              where: {
                status: 'active',
                isArchived: false,
              },
            },
            llmTransactions: {
              where: {
                isArchived: false,
              },
            },
            apiKeys: {
              where: {
                isActive: true,
                isArchived: false,
              },
            },
          },
        },
        appMemberships: {
          where: {
            userId: user.id,
            isArchived: false,
          },
          select: {
            id: true,
            role: true,
            status: true,
            totalSpent: true,
            createdAt: true,
          },
        },
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found or inactive' },
        { status: 404 }
      );
    }

    // Get owner information
    const owner = await db.appMembership.findFirst({
      where: {
        echoAppId: appId,
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
          },
        },
      },
    });

    // Get recent transaction stats for activity indicator
    const recentTransactions = await db.llmTransaction.count({
      where: {
        echoAppId: appId,
        isArchived: false,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    // Calculate total revenue (sum of all transactions)
    const totalRevenue = await db.llmTransaction.aggregate({
      where: {
        echoAppId: appId,
        isArchived: false,
      },
      _sum: {
        cost: true,
      },
    });

    // Transform the data using marketplace customizations when available
    const detailedApp = {
      id: app.id,
      name: app.marketplaceName || app.name, // Use custom name if set
      description: app.marketplaceDescription || app.description, // Use custom description if set
      imageUrl: app.marketplaceImageUrl, // Custom image URL (optional)
      appUrl: app.marketplaceUrl, // Custom app URL (optional)
      createdAt: app.createdAt,
      markup: app.markUp,
      githubId: app.githubId,
      githubType: app.githubType,
      memberCount: app._count.appMemberships,
      transactionCount: app._count.llmTransactions,
      apiKeyCount: app._count.apiKeys,
      recentTransactions,
      totalRevenue: totalRevenue._sum.cost || 0,
      userMembership: app.appMemberships[0] || null,
      owner: owner
        ? {
            name: owner.user.name || owner.user.email,
            email: owner.user.email,
          }
        : null,
    };

    return NextResponse.json({ app: detailedApp });
  } catch (error) {
    console.error('Error fetching marketplace app details:', error);

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
