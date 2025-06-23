import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';

// GET /api/owner/apps/[id]/marketplace-settings - Get current marketplace settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    const user = await getCurrentUser();

    // Check if user has permission to manage the app
    const hasPermission = await PermissionService.hasPermission(
      user.id,
      appId,
      Permission.EDIT_APP
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Get app marketplace settings
    const app = await db.echoApp.findFirst({
      where: {
        id: appId,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        marketplaceName: true,
        marketplaceDescription: true,
        marketplaceImageUrl: true,
        marketplaceUrl: true,
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({
      app: {
        id: app.id,
        name: app.name,
        description: app.description,
        marketplaceName: app.marketplaceName,
        marketplaceDescription: app.marketplaceDescription,
        marketplaceImageUrl: app.marketplaceImageUrl,
        marketplaceUrl: app.marketplaceUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching marketplace settings:', error);

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

// PUT /api/owner/apps/[id]/marketplace-settings - Update marketplace settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    const user = await getCurrentUser();
    const body = await request.json();

    // Check if user has permission to manage the app
    const hasPermission = await PermissionService.hasPermission(
      user.id,
      appId,
      Permission.EDIT_APP
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Validate input
    const {
      marketplaceName,
      marketplaceDescription,
      marketplaceImageUrl,
      marketplaceUrl,
    } = body;

    // Basic validation
    if (marketplaceName && typeof marketplaceName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid marketplace name' },
        { status: 400 }
      );
    }

    if (marketplaceDescription && typeof marketplaceDescription !== 'string') {
      return NextResponse.json(
        { error: 'Invalid marketplace description' },
        { status: 400 }
      );
    }

    if (marketplaceImageUrl && typeof marketplaceImageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid marketplace image URL' },
        { status: 400 }
      );
    }

    if (marketplaceUrl && typeof marketplaceUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid marketplace URL' },
        { status: 400 }
      );
    }

    // URL validation
    if (marketplaceImageUrl) {
      try {
        new URL(marketplaceImageUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid image URL format' },
          { status: 400 }
        );
      }
    }

    if (marketplaceUrl) {
      try {
        new URL(marketplaceUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid app URL format' },
          { status: 400 }
        );
      }
    }

    // Update app marketplace settings
    const updatedApp = await db.echoApp.update({
      where: { id: appId },
      data: {
        marketplaceName: marketplaceName || null,
        marketplaceDescription: marketplaceDescription || null,
        marketplaceImageUrl: marketplaceImageUrl || null,
        marketplaceUrl: marketplaceUrl || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        marketplaceName: true,
        marketplaceDescription: true,
        marketplaceImageUrl: true,
        marketplaceUrl: true,
      },
    });

    return NextResponse.json({
      app: updatedApp,
      message: 'Marketplace settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating marketplace settings:', error);

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
