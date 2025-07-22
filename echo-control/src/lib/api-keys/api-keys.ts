import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { softDeleteApiKey } from '@/lib/soft-delete';
import { findApiKey, updateApiKey } from '@/lib/api-keys';

// PATCH /api/api-keys/[id] - Update an API key (rename)
export async function patchApiKey(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const apiKey = await findApiKey(id, user.id);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found or access denied' },
        { status: 404 }
      );
    }

    // Update the API key
    const updatedApiKey = await updateApiKey(id, user.id, { name });

    return NextResponse.json({ apiKey: updatedApiKey });
  } catch (error) {
    console.error('Error updating API key:', error);

    if (error instanceof Error && error.message === 'Not authenticated') {
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

// DELETE /api/api-keys/[id] - Archive an API key (soft delete)
export async function deleteApiKey(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Find the API key and check if it belongs to the user
    const apiKey = await findApiKey(id, user.id);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found or access denied' },
        { status: 404 }
      );
    }

    // Archive the API key (soft delete)
    await softDeleteApiKey(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving API key:', error);

    if (error instanceof Error && error.message === 'Not authenticated') {
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
