import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';

// GET /api/owner/apps/[id]/revenue - Get revenue data for app owners
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    // Check if user has permission to view analytics/revenue
    const hasPermission = await PermissionService.hasPermission(
      user.id,
      appId,
      Permission.VIEW_ANALYTICS
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Optional pagination and filtering parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);

    // Get all revenue records for the app with pagination
    const revenues = await db.revenue.findMany({
      where: {
        echoAppId: appId,
        isArchived: false,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        transaction: {
          select: {
            id: true,
            model: true,
            cost: true,
            inputTokens: true,
            outputTokens: true,
            totalTokens: true,
            status: true,
          },
        },
        creditGrant: {
          select: {
            id: true,
            type: true,
            amount: true,
            source: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await db.revenue.count({
      where: {
        echoAppId: appId,
        isArchived: false,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
    });

    // Get revenue summary
    const revenueSummary = await db.revenue.aggregate({
      where: {
        echoAppId: appId,
        isArchived: false,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Get revenue breakdown by type
    const revenueByType = await db.revenue.groupBy({
      by: ['type'],
      where: {
        echoAppId: appId,
        isArchived: false,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Format revenue records for the response
    const formattedRevenues = revenues.map(revenue => ({
      id: revenue.id,
      amount: Number(revenue.amount),
      type: revenue.type,
      description: revenue.description,
      createdAt: revenue.createdAt.toISOString(),
      user: {
        id: revenue.user.id,
        email: revenue.user.email,
        name: revenue.user.name,
      },
      transaction: revenue.transaction
        ? {
            id: revenue.transaction.id,
            model: revenue.transaction.model,
            cost: Number(revenue.transaction.cost),
            inputTokens: revenue.transaction.inputTokens,
            outputTokens: revenue.transaction.outputTokens,
            totalTokens: revenue.transaction.totalTokens,
            status: revenue.transaction.status,
          }
        : null,
      creditGrant: revenue.creditGrant
        ? {
            id: revenue.creditGrant.id,
            type: revenue.creditGrant.type,
            amount: Number(revenue.creditGrant.amount),
            source: revenue.creditGrant.source,
            description: revenue.creditGrant.description,
          }
        : null,
    }));

    return NextResponse.json({
      revenues: formattedRevenues,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary: {
        totalRevenue: Number(revenueSummary._sum.amount || 0),
        revenueCount: revenueSummary._count,
        dateRange: {
          from: dateFrom || null,
          to: dateTo || null,
        },
      },
      breakdown: {
        byType: revenueByType.map(breakdown => ({
          type: breakdown.type,
          amount: Number(breakdown._sum.amount || 0),
          count: breakdown._count,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching app revenue:', error);

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
