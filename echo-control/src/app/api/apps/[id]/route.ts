import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getDetailedAppInfo,
  updateEchoAppById,
  deleteEchoAppById,
  AppUpdateInput,
} from '@/lib/echo-apps';

// GET /api/apps/[id] - Get detailed app information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const resolvedParams = await params;
    const { id: appId } = resolvedParams;

    const appWithStats = await getDetailedAppInfo(appId, user.id);

    return NextResponse.json(appWithStats);
  } catch (error) {
    console.error('Error fetching echo app:', error);

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

    if (
      error instanceof Error &&
      error.message.includes('not found or access denied')
    ) {
      return NextResponse.json(
        { error: 'Echo app not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/apps/[id] - Update app information
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const resolvedParams = await params;
    const { id: appId } = resolvedParams;

    const body = await request.json();
    const { name, description, isActive, maxPerUserPoolSpendAmount } = body;
    const updateData: AppUpdateInput = {
      name,
      description,
      isActive,
      maxPerUserPoolSpendAmount,
    };

    const updatedApp = await updateEchoAppById(appId, user.id, updateData);

    return NextResponse.json(updatedApp);
  } catch (error) {
    console.error('Error updating echo app:', error);

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

    if (
      error instanceof Error &&
      error.message.includes('not found or access denied')
    ) {
      return NextResponse.json(
        { error: 'Echo app not found or access denied' },
        { status: 404 }
      );
    }

    // Handle validation errors
    if (
      error instanceof Error &&
      (error.message.includes('required') ||
        error.message.includes('must be') ||
        error.message.includes('characters'))
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/apps/[id] - Archive an echo app (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const resolvedParams = await params;
    const { id: appId } = resolvedParams;

    const result = await deleteEchoAppById(appId, user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error archiving echo app:', error);

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

    if (
      error instanceof Error &&
      error.message.includes('not found or access denied')
    ) {
      return NextResponse.json(
        { error: 'Echo app not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
