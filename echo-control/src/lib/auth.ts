import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from './db';
import { User, EchoApp } from '@/generated/prisma';
import { NextRequest } from 'next/server';
import { hashApiKey } from './crypto';
import { authenticateEchoAccessJwtToken } from './jwt-tokens';

/**
 * Get the current user from Clerk
 * Should be used for endpoints coming from the merit-hosted echo client
 * @returns The current user
 */
export async function getCurrentUser(): Promise<User> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Get user from Clerk
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error('Clerk user not found');
  }

  // Try to find existing user in our database
  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  // If user doesn't exist, create them
  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name:
          `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
          null,
        profilePictureUrl: clerkUser.imageUrl || null, // Get profile picture from Clerk
      },
    });
  } else {
    // Update profile picture if it's changed in Clerk
    if (user.profilePictureUrl !== clerkUser.imageUrl) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          profilePictureUrl: clerkUser.imageUrl || null,
        },
      });
    }
  }

  return user;
}

export async function getOrCreateUserFromClerkId(
  clerkId: string
): Promise<User> {
  // Get user from Clerk
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error('Clerk user not found');
  }
  // Try to find existing user in our database
  let user = await db.user.findUnique({
    where: { clerkId: clerkId },
  });

  // If user doesn't exist, create them
  if (!user) {
    console.log('Creating user from Clerk ID:', clerkId);
    user = await db.user.create({
      data: {
        clerkId: clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name:
          `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
          null,
        profilePictureUrl: clerkUser.imageUrl || null, // Get profile picture from Clerk
      },
    });
  } else {
    // Update profile picture if it's changed in Clerk
    if (user.profilePictureUrl !== clerkUser.imageUrl) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          profilePictureUrl: clerkUser.imageUrl || null,
        },
      });
    }
  }

  return user;
}

/**
 * Get the current user from an Echo API key or Echo Access JWT
 * Should be used for API requests on the /v1 endpoint
 * @param request - The request object
 * @returns The current user, apiKey, and echoApp
 */
export async function getCurrentUserByApiKeyOrEchoJwt(
  request: NextRequest
): Promise<{
  user: User;
  echoApp: EchoApp;
}> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader; // Remove 'Bearer ' prefix

  // Check if token is a JWT (has 3 parts separated by dots)
  const isJWT = token.split('.').length === 3;

  if (isJWT) {
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
      throw new Error('User not found');
    }

    if (!app) {
      throw new Error('App not found');
    }

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

    // Verify the API key is valid and all related entities are not archived
    if (
      !apiKeyRecord ||
      apiKeyRecord.isArchived ||
      apiKeyRecord.user.isArchived ||
      apiKeyRecord.echoApp.isArchived
    ) {
      throw new Error('Invalid or archived API key');
    }

    // Update last used timestamp and metadata
    await updateApiKeyUsage(apiKeyRecord.id, request);

    return {
      user: apiKeyRecord.user,
      echoApp: apiKeyRecord.echoApp,
    };
  }
}

export async function updateApiKeyUsage(
  apiKeyId: string,
  request: NextRequest
) {
  try {
    const metadata = {
      lastIp:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
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

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const authResult = await getCurrentUserByApiKeyOrEchoJwt(request);

    return {
      user: authResult.user,
      echoApp: authResult.echoApp,
    };
  }

  throw new Error('Invalid authorization header');
}
