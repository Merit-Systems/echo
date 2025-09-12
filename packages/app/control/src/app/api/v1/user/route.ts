import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { User } from '@/generated/prisma';
import { logger } from '@/logger';

// GET /api/v1/user - Get authenticated user information
export async function GET(request: NextRequest) {
  try {
    let user: User;
    try {
      const { user: userResult } = await getAuthenticatedUser(request);
      user = userResult;
    } catch (error) {
      logger.emit({
        severityText: 'ERROR',
        body: 'Error fetching user for v1 user endpoint',
        attributes: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return user data in the format expected by the TypeScript SDK
    const responseData = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      totalPaid: Number(user.totalPaid),
      totalSpent: Number(user.totalSpent),
      picture: user.image,
    };

    logger.emit({
      severityText: 'INFO',
      body: 'Successfully fetched user information',
      attributes: {
        userId: user.id,
      },
    });

    return NextResponse.json(responseData);
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error fetching user info',
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
      logger.emit({
        severityText: 'WARN',
        body: 'Authentication error in v1 user endpoint',
        attributes: {
          error: error.message,
        },
      });
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
