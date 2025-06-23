import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/marketplace - List all discoverable apps
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Get all active apps with basic info and stats
    const apps = await db.echoApp.findMany({
      where: {
        isActive: true,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        markUp: true,
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
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    // Transform the data to include user membership status and marketplace customizations
    const transformedApps = apps.map(app => ({
      id: app.id,
      name: app.marketplaceName || app.name, // Use custom name if set, otherwise default
      description: app.marketplaceDescription || app.description, // Use custom description if set
      imageUrl: app.marketplaceImageUrl, // Custom image URL (optional)
      appUrl: app.marketplaceUrl, // Custom app URL (optional)
      createdAt: app.createdAt,
      markup: app.markUp,
      memberCount: app._count.appMemberships,
      transactionCount: app._count.llmTransactions,
      userMembership: app.appMemberships[0] || null, // User can only have one membership per app
    }));

    return NextResponse.json({ apps: transformedApps });
  } catch (error) {
    console.error('Error fetching marketplace apps:', error);

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
