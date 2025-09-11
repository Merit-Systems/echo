import { db } from './db';
import type { User, EchoApp } from '@/generated/prisma';
import type { NextRequest } from 'next/server';
import { hashApiKey } from './crypto';
import { authenticateEchoAccessJwtToken } from './jwt-tokens';
import { auth } from '@/auth';
import { logger } from '@/logger';

export async function getCurrentUser(): Promise<User> {
  const session = await auth();

  if (!session?.user?.id) {
    logger.emit({
      severityText: 'WARN',
      body: 'Unauthenticated session in getCurrentUser',
      attributes: {
        function: 'getCurrentUser',
        hasSession: !!session,
        hasUser: !!session?.user,
      },
    });
    throw new Error('Not authenticated');
  }

  // Try to find existing user in our database
  let user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  // If user doesn't exist, create them
  if (!user) {
    user = await db.user.create({
      data: {
        email: session.user.email ?? '',
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      },
    });

    logger.emit({
      severityText: 'INFO',
      body: 'Created new user from session',
      attributes: {
        userId: user.id,
        email: user.email,
        function: 'getCurrentUser',
      },
    });
  } else {
    if (user.image !== session.user.image) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          image: session.user.image ?? null,
        },
      });

      logger.emit({
        severityText: 'DEBUG',
        body: 'Updated user image from session',
        attributes: {
          userId: user.id,
          function: 'getCurrentUser',
        },
      });
    }
  }

  logger.emit({
    severityText: 'DEBUG',
    body: 'Successfully retrieved current user',
    attributes: {
      userId: user.id,
      function: 'getCurrentUser',
    },
  });

  return user;
}

/**
 * Get the current user from an Echo API key or Echo Access JWT
 * Should be used for API requests on the /v1 endpoint
 * @param request - The request object
 * @returns The current user, apiKey, and echoApp
 */
async function getCurrentUserByApiKeyOrEchoJwt(request: NextRequest): Promise<{
  user: User;
  echoApp: EchoApp;
}> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    logger.emit({
      severityText: 'WARN',
      body: 'Invalid authorization header in API authentication',
      attributes: {
        hasAuthHeader: !!authHeader,
        authHeaderPrefix: authHeader?.substring(0, 10) ?? null,
        function: 'getCurrentUserByApiKeyOrEchoJwt',
      },
    });
    throw new Error('Invalid authorization header');
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader; // Remove 'Bearer ' prefix

  // Check if token is a JWT (has 3 parts separated by dots)
  const isJWT = token.split('.').length === 3;

  if (isJWT) {
    logger.emit({
      severityText: 'DEBUG',
      body: 'Authenticating with JWT token',
      attributes: {
        tokenType: 'JWT',
        function: 'getCurrentUserByApiKeyOrEchoJwt',
      },
    });

    const { userId, appId } = await authenticateEchoAccessJwtToken(token);

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    const app = await db.echoApp.findUnique({
      where: {
        id: appId,
      },
    });

    if (!user) {
      logger.emit({
        severityText: 'ERROR',
        body: 'User not found for valid JWT token',
        attributes: {
          userId,
          appId,
          function: 'getCurrentUserByApiKeyOrEchoJwt',
        },
      });
      throw new Error('User not found');
    }

    if (!app) {
      logger.emit({
        severityText: 'ERROR',
        body: 'App not found for valid JWT token',
        attributes: {
          userId,
          appId,
          function: 'getCurrentUserByApiKeyOrEchoJwt',
        },
      });
      throw new Error('App not found');
    }

    logger.emit({
      severityText: 'INFO',
      body: 'Successfully authenticated with JWT token',
      attributes: {
        userId,
        appId,
        function: 'getCurrentUserByApiKeyOrEchoJwt',
      },
    });

    return {
      user,
      echoApp: app,
    };
  } else {
    // Handle traditional API key (existing logic)
    // Hash the provided API key for direct O(1) lookup
    const keyHash = hashApiKey(token);

    /// This is a DOS vector, but we're not going to fix it now
    // Direct lookup by keyHash - O(1) operation!
    const apiKeyRecord = await db.apiKey.findUnique({
      where: {
        keyHash,
      },
      include: {
        user: true,
        echoApp: true,
      },
    });

    // Verify the API key is valid and all related entities are active
    if (
      !apiKeyRecord ||
      apiKeyRecord.isArchived ||
      apiKeyRecord.user.isArchived ||
      apiKeyRecord.echoApp.isArchived
    ) {
      throw new Error('Invalid or inactive API key');
    }

    // Update last used timestamp and metadata
    await updateApiKeyUsage(apiKeyRecord.id, request);

    return {
      user: apiKeyRecord.user,
      echoApp: apiKeyRecord.echoApp,
    };
  }
}

async function updateApiKeyUsage(apiKeyId: string, request: NextRequest) {
  try {
    const metadata = {
      lastIp:
        request.headers.get('x-forwarded-for') ??
        request.headers.get('x-real-ip') ??
        'unknown',
      userAgent: request.headers.get('user-agent') ?? 'unknown',
      timestamp: new Date().toISOString(),
    };

    await db.apiKey.update({
      where: { id: apiKeyId },
      data: {
        lastUsed: new Date(),
        metadata,
      },
    });
  } catch (error) {
    // Don't fail the request if updating usage fails
    console.error('Failed to update API key usage:', error);
  }
}

// Shared authentication function that supports Echo API key or Echo Access JWT authentication
export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const authResult = await getCurrentUserByApiKeyOrEchoJwt(request);

    return {
      user: authResult.user,
      echoApp: authResult.echoApp,
    };
  }

  throw new Error('Invalid authorization header');
}
