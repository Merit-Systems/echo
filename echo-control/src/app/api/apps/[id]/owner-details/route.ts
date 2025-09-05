import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';
import { auth } from '@/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/apps/[id]/owner-details - Get basic app info and owner details for OAuth flows
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid app ID format' },
        { status: 400 }
      );
    }

    // Fetch app with owner details - no authentication required for OAuth flows
    const echoApp = await db.echoApp.findUnique({
      where: {
        id,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        markUp: {
          select: {
            amount: true,
            description: true,
          },
        },
        appMemberships: {
          where: {
            role: 'owner',
            isArchived: false,
          },
          select: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!echoApp) {
      return NextResponse.json(
        { error: 'Echo app not found or inactive' },
        { status: 404 }
      );
    }

    // Find the owner
    const owner = echoApp.appMemberships.find(
      membership => membership.role === 'owner'
    );

    return NextResponse.json({
      id: echoApp.id,
      name: echoApp.name,
      description: echoApp.description,
      markup: echoApp.markUp?.amount || 1.0, // Default to 1.0 if no markup is set
      owner: owner
        ? {
            name: owner.user.name,
            email: owner.user.email,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching app owner details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/apps/[id]/owner-details - Update app markup
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate UUID format
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid app ID format' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is owner of the app
    const hasPermission = await PermissionService.hasPermission(
      user.id,
      id,
      Permission.EDIT_APP
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { markup } = body;

    // Validate markup (1x to 10x inclusive)
    if (typeof markup !== 'number' || markup < 1 || markup > 10) {
      return NextResponse.json(
        { error: 'Markup must be between 1x and 10x (i.e. 0% - 1000%)' },
        { status: 400 }
      );
    }

    // Create or update the markup record
    const markupRecord = await db.markUp.upsert({
      where: {
        echoAppId: id,
      },
      update: {
        amount: markup,
        isArchived: false,
      },
      create: {
        echoAppId: id,
        amount: markup,
        description: 'App markup rate',
        isArchived: false,
      },
      select: {
        amount: true,
        echoApp: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      app: {
        id: markupRecord.echoApp.id,
        name: markupRecord.echoApp.name,
        markup: markupRecord.amount,
      },
    });
  } catch (error) {
    console.error('Error updating app markup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
