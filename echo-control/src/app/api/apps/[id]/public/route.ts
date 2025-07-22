import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';
import { db } from '@/lib/db';

// POST /api/apps/[id]/public - Update the public status of an Echo app
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: appId } = await params;
    const body = await req.json();

    // Validate request body
    if (typeof body.isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean' },
        { status: 400 }
      );
    }

    // Check if user has permission to edit this app
    const hasEditPermission = await PermissionService.hasPermission(
      user.id,
      appId,
      Permission.EDIT_APP
    );

    if (!hasEditPermission) {
      return NextResponse.json(
        { error: 'Echo app not found or access denied' },
        { status: 403 }
      );
    }

    // Verify the echo app exists and is not archived
    const existingApp = await db.echoApp.findFirst({
      where: {
        id: appId,
        isArchived: false,
      },
    });

    if (!existingApp) {
      return NextResponse.json(
        { error: 'Echo app not found' },
        { status: 404 }
      );
    }

    // Update the app's public status
    const updatedApp = await db.echoApp.update({
      where: { id: appId },
      data: {
        isPublic: body.isPublic,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: `App ${body.isPublic ? 'made public' : 'made private'} successfully`,
      app: {
        id: updatedApp.id,
        name: updatedApp.name,
        description: updatedApp.description,
        isPublic: updatedApp.isPublic,
        createdAt: updatedApp.createdAt.toISOString(),
        updatedAt: updatedApp.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating app public status:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required', details: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
