import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';
import { getCurrentMarkup, setCurrentMarkup } from '@/lib/markup';

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

    // Get current markup for the app
    const currentMarkupRate = await getCurrentMarkup(id);

    // Find the owner
    const owner = echoApp.appMemberships.find(
      membership => membership.role === 'owner'
    );

    return NextResponse.json({
      id: echoApp.id,
      name: echoApp.name,
      description: echoApp.description,
      markup: currentMarkupRate || 1.0, // Default to 1.0 if no markup set
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
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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
      where: { clerkId: userId },
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

    // Validate markup
    if (typeof markup !== 'number' || markup < 1.0) {
      return NextResponse.json(
        { error: 'Markup must be a number 1.0 or higher' },
        { status: 400 }
      );
    }

    // Update the app markup using the new markup system
    const result = await setCurrentMarkup(id, markup, `Markup ${markup}x`);

    return NextResponse.json({
      success: true,
      app: {
        id: result.app.id,
        name: result.app.name,
        markup: Number(result.markup.rate),
      },
      markupId: result.markup.id,
    });
  } catch (error) {
    console.error('Error updating app markup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
