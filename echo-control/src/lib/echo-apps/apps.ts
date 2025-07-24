import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import {
  createEchoApp,
  AppCreateInput,
  updateEchoAppById,
  deleteEchoAppById,
  AppUpdateInput,
  getAppInfo,
} from '@/lib/echo-apps';
import { isValidUUID } from '@/lib/oauth-config/index';
import { bulkGetAllUserAccessibleApps } from '@/lib/echo-apps';
import { verifyArgs } from './utils';

// GET /api/apps - List all Echo apps for the authenticated user
export async function getApps() {
  try {
    const user = await getCurrentUser();
    const apps = await bulkGetAllUserAccessibleApps(user.id);

    return NextResponse.json({ apps });
  } catch (error) {
    console.error('Error fetching Echo apps:', error);

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

// POST /api/apps - Create a new Echo app
export async function createApp(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const { name, description, githubType, githubId, authorizedCallbackUrls } =
      body;
    const appData: AppCreateInput = {
      name,
      description,
      githubType,
      githubId,
      authorizedCallbackUrls,
    };

    const echoApp = await createEchoApp(user.id, appData);

    return NextResponse.json(
      {
        id: echoApp.id,
        name: echoApp.name,
        description: echoApp.description,
        github_type: echoApp.githubType,
        github_id: echoApp.githubId,
        created_at: echoApp.createdAt.toISOString(),
        updated_at: echoApp.updatedAt.toISOString(),
        authorized_callback_urls: echoApp.authorizedCallbackUrls,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating Echo app:', error);

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

// GET /api/apps/[id] - Get detailed app information
export async function getApp(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const resolvedParams = await params;
    const { id: appId } = resolvedParams;

    // Check for view parameter (currently unused but available for future use)
    // const { searchParams } = new URL(request.url);
    // const view = searchParams.get('view');

    // Validate UUID format
    if (!isValidUUID(appId)) {
      return NextResponse.json(
        { error: 'Invalid app ID format' },
        { status: 400 }
      );
    }

    // For global view, fetch global data
    const appWithStats = await getAppInfo(appId, user.id);

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

// PUT /api/apps/[id] - Update an existing Echo app
export async function updateApp(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const resolvedParams = await params;
    const appId = resolvedParams.id;

    // Extract allowed update fields
    const {
      name,
      description,
      githubType,
      githubId,
      authorizedCallbackUrls,
      profilePictureUrl,
      bannerImageUrl,
      homepageUrl,
      isPublic,
    } = body;

    // Validate input fields
    const validationError = verifyArgs({
      name,
      description,
      githubType,
      githubId,
      authorizedCallbackUrls,
      profilePictureUrl,
      bannerImageUrl,
      homepageUrl,
      isPublic,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const updateData: AppUpdateInput = {};

    // Only include provided fields in the update
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (githubType !== undefined) updateData.githubType = githubType;
    if (githubId !== undefined) updateData.githubId = githubId;
    if (authorizedCallbackUrls !== undefined)
      updateData.authorizedCallbackUrls = authorizedCallbackUrls;
    if (profilePictureUrl !== undefined)
      updateData.profilePictureUrl = profilePictureUrl;
    if (bannerImageUrl !== undefined)
      updateData.bannerImageUrl = bannerImageUrl;
    if (homepageUrl !== undefined) updateData.homepageUrl = homepageUrl;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedApp = await updateEchoAppById(appId, user.id, updateData);

    return NextResponse.json({
      id: updatedApp.id,
      name: updatedApp.name,
      description: updatedApp.description,
      github_type: updatedApp.githubType,
      github_id: updatedApp.githubId,
      created_at: updatedApp.createdAt.toISOString(),
      updated_at: updatedApp.updatedAt.toISOString(),
      authorized_callback_urls: updatedApp.authorizedCallbackUrls,
      profile_picture_url: updatedApp.profilePictureUrl,
      banner_image_url: updatedApp.bannerImageUrl,
      homepage_url: updatedApp.homepageUrl,
    });
  } catch (error) {
    console.error('Error updating Echo app:', error);

    // Handle validation errors
    if (
      error instanceof Error &&
      (error.message.includes('required') ||
        error.message.includes('must be') ||
        error.message.includes('characters') ||
        error.message.includes('not found') ||
        error.message.includes('access denied'))
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
export async function deleteApp(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const resolvedParams = await params;
    const { id: appId } = resolvedParams;

    // Validate UUID format
    if (!isValidUUID(appId)) {
      return NextResponse.json(
        { error: 'Invalid app ID format' },
        { status: 400 }
      );
    }

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
