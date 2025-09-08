import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/logger';
import { createApiKey, createApiKeySchema } from '@/services/api-keys';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/v1/apps/[id]/api-keys - Create a new API key for the app
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, echoApp } = await getAuthenticatedUser(request);

    const resolvedParams = await params;
    const appId = resolvedParams.id;

    if (echoApp && echoApp.id !== appId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = createApiKeySchema.safeParse({
      echoAppId: appId,
      name: body?.name,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const apiKey = await createApiKey(user.id, parsed.data);

    logger.emit?.({
      severityText: 'INFO',
      body: 'API key created',
      attributes: { userId: user.id, appId },
    });

    return NextResponse.json({ apiKey });
  } catch (error) {
    logger.emit?.({
      severityText: 'ERROR',
      body: 'Error creating API key',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    if (
      error instanceof Error &&
      (error.message.includes('Not authenticated') ||
        error.message.includes('Unauthorized'))
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
