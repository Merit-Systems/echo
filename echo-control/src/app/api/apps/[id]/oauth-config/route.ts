import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { isValidUUID } from '@/lib/oauth-config/index';
import { findEchoApp, updateEchoApp } from '@/lib/echo-apps/index';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/apps/[id]/oauth-config - Get OAuth configuration
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid app ID format' },
        { status: 400 }
      );
    }

    const echoApp = await findEchoApp(id, user.id);

    if (!echoApp) {
      return NextResponse.json(
        { error: 'Echo app not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      client_id: echoApp.id,
      name: echoApp.name,
      description: echoApp.description,
      authorized_callback_urls: echoApp.authorizedCallbackUrls,
      oauth_endpoints: {
        authorization_url: `${req.nextUrl.origin}/api/oauth/authorize`,
        token_url: `${req.nextUrl.origin}/api/oauth/token`,
        refresh_url: `${req.nextUrl.origin}/api/oauth/token`,
      },
    });
  } catch (error) {
    console.error('Error fetching OAuth config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/apps/[id]/oauth-config - Update OAuth configuration
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid app ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const { authorized_callback_urls } = body;

    // Validate authorized_callback_urls
    if (!Array.isArray(authorized_callback_urls)) {
      return NextResponse.json(
        { error: 'authorized_callback_urls must be an array' },
        { status: 400 }
      );
    }

    // Validate each URL
    for (const url of authorized_callback_urls) {
      if (typeof url !== 'string') {
        return NextResponse.json(
          { error: 'All callback URLs must be strings' },
          { status: 400 }
        );
      }

      try {
        new URL(url); // This will throw if URL is invalid
      } catch {
        return NextResponse.json(
          { error: `Invalid URL: ${url}` },
          { status: 400 }
        );
      }

      // Security: Only allow HTTPS in production (except localhost)
      const urlObj = new URL(url);
      if (
        process.env.NODE_ENV === 'production' &&
        urlObj.protocol !== 'https:' &&
        !urlObj.hostname.includes('localhost')
      ) {
        return NextResponse.json(
          { error: `HTTPS required for production URLs: ${url}` },
          { status: 400 }
        );
      }
    }

    // Check if Echo app exists and user owns it
    const echoApp = await findEchoApp(id, user.id);

    if (!echoApp) {
      return NextResponse.json(
        { error: 'Echo app not found' },
        { status: 404 }
      );
    }

    const updatedApp = await updateEchoApp(
      id,
      user.id,
      {
        authorizedCallbackUrls: authorized_callback_urls,
      },
      {
        id: true,
        name: true,
        description: true,
        authorizedCallbackUrls: true,
      }
    );

    return NextResponse.json({
      client_id: updatedApp.id,
      name: updatedApp.name,
      description: updatedApp.description,
      authorized_callback_urls: updatedApp.authorizedCallbackUrls,
      oauth_endpoints: {
        authorization_url: `${req.nextUrl.origin}/api/oauth/authorize`,
        token_url: `${req.nextUrl.origin}/api/oauth/token`,
        refresh_url: `${req.nextUrl.origin}/api/oauth/token`,
      },
    });
  } catch (error) {
    console.error('Error updating OAuth config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/apps/[id]/oauth-config - Add a callback URL
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid app ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const { callback_url } = body;

    if (!callback_url || typeof callback_url !== 'string') {
      return NextResponse.json(
        { error: 'callback_url is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(callback_url);
    } catch {
      return NextResponse.json(
        { error: `Invalid URL: ${callback_url}` },
        { status: 400 }
      );
    }

    // Security: Only allow HTTPS in production (except localhost)
    const urlObj = new URL(callback_url);
    if (
      process.env.NODE_ENV === 'production' &&
      urlObj.protocol !== 'https:' &&
      !urlObj.hostname.includes('localhost')
    ) {
      return NextResponse.json(
        { error: `HTTPS required for production URLs: ${callback_url}` },
        { status: 400 }
      );
    }

    // Get current Echo app
    const echoApp = await findEchoApp(id, user.id);

    if (!echoApp) {
      return NextResponse.json(
        { error: 'Echo app not found' },
        { status: 404 }
      );
    }

    // Check if URL already exists
    if (echoApp.authorizedCallbackUrls.includes(callback_url)) {
      return NextResponse.json(
        { error: 'Callback URL already exists' },
        { status: 400 }
      );
    }

    // Add the new callback URL
    const updatedApp = await updateEchoApp(
      id,
      user.id,
      {
        authorizedCallbackUrls: [
          ...echoApp.authorizedCallbackUrls,
          callback_url,
        ],
      },
      {
        authorizedCallbackUrls: true,
      }
    );

    return NextResponse.json({
      message: 'Callback URL added successfully',
      authorized_callback_urls: updatedApp.authorizedCallbackUrls,
    });
  } catch (error) {
    console.error('Error adding callback URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/apps/[id]/oauth-config - Remove a callback URL
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid app ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const { callback_url } = body;

    if (!callback_url || typeof callback_url !== 'string') {
      return NextResponse.json(
        { error: 'callback_url is required and must be a string' },
        { status: 400 }
      );
    }

    // Get current Echo app
    const echoApp = await findEchoApp(id, user.id);

    if (!echoApp) {
      return NextResponse.json(
        { error: 'Echo app not found' },
        { status: 404 }
      );
    }

    // Check if URL exists
    if (!echoApp.authorizedCallbackUrls.includes(callback_url)) {
      return NextResponse.json(
        { error: 'Callback URL not found' },
        { status: 404 }
      );
    }

    // Remove the callback URL
    const updatedCallbackUrls = echoApp.authorizedCallbackUrls.filter(
      url => url !== callback_url
    );

    const updatedApp = await updateEchoApp(
      id,
      user.id,
      {
        authorizedCallbackUrls: updatedCallbackUrls,
      },
      {
        authorizedCallbackUrls: true,
      }
    );

    return NextResponse.json({
      message: 'Callback URL removed successfully',
      authorized_callback_urls: updatedApp.authorizedCallbackUrls,
    });
  } catch (error) {
    console.error('Error removing callback URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
