import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';

// GET /api/owner/apps/[id]/earnings - List all LLM transactions for the app with pagination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    // Check if user has permission to view analytics/earnings
    const hasPermission = await PermissionService.hasPermission(
      user.id,
      appId,
      Permission.VIEW_ANALYTICS
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Optional pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get all LLM transactions for the app with pagination
    const transactions = await db.transaction.findMany({
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
          },
        },
        apiKey: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await db.transaction.count({
      where: {
        echoAppId: appId,
        isArchived: false,
      },
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Format transactions for the response
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      model: transaction.model,
      providerId: transaction.providerId,
      inputTokens: transaction.inputTokens,
      outputTokens: transaction.outputTokens,
      totalTokens: transaction.totalTokens,
      cost: Number(transaction.cost),
      status: transaction.status,
      errorMessage: transaction.errorMessage,
      createdAt: transaction.createdAt.toISOString(),
      user: {
        id: transaction.user.id,
        email: transaction.user.email,
        name: transaction.user.name,
        profilePictureUrl: transaction.user.profilePictureUrl,
      },
      apiKey: transaction.apiKey
        ? {
            id: transaction.apiKey.id,
            name: transaction.apiKey.name,
          }
        : null,
    }));

    // Calculate totals for summary
    const totalCost = transactions.reduce(
      (sum, tx) => sum + Number(tx.cost),
      0
    );
    const totalTokens = transactions.reduce(
      (sum, tx) => sum + tx.totalTokens,
      0
    );

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary: {
        totalCost,
        totalTokens,
        transactionCount: formattedTransactions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching app earnings:', error);

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
