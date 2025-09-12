import { db } from '@/lib/db';
import { Owner, OwnerEchoApp } from './types';
import { Prisma } from '@/generated/prisma';
import {
  getOwnerStatistics,
  getOwnerStatisticsBatch,
} from './owner-statistics';

/**
 * Get owner details for an echo app
 * @param echoAppId - The ID of the echo app
 * @param tx - Optional Prisma transaction client
 * @returns Owner details including id, email, name, and profile picture
 */
export async function getOwnerDetails(
  echoAppId: string,
  tx?: Prisma.TransactionClient
): Promise<Owner | null> {
  const client = tx || db;

  // Find the owner through AppMembership with role 'owner'
  const ownerMembership = await client.appMembership.findFirst({
    where: {
      echoAppId,
      role: 'owner',
      isArchived: false,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!ownerMembership) {
    return null;
  }

  return {
    id: ownerMembership.user.id,
    email: ownerMembership.user.email,
    name: ownerMembership.user.name,
    image: ownerMembership.user.image,
  };
}

/**
 * Batch fetch owner details for multiple echo apps
 * @param echoAppIds - Array of echo app IDs
 * @param tx - Optional Prisma transaction client
 * @returns Map of echo app ID to owner details
 */
async function getOwnerDetailsBatch(
  echoAppIds: string[],
  tx?: Prisma.TransactionClient
): Promise<Map<string, Owner>> {
  const client = tx || db;

  // Fetch all owner memberships in a single query
  const ownerMemberships = await client.appMembership.findMany({
    where: {
      echoAppId: { in: echoAppIds },
      role: 'owner',
      isArchived: false,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // Create a map for O(1) lookup
  const ownersMap = new Map<string, Owner>();

  for (const membership of ownerMemberships) {
    ownersMap.set(membership.echoAppId, {
      id: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      image: membership.user.image,
    });
  }

  return ownersMap;
}

/**
 * Get owner echo app with all owner-level statistics
 * @param id - The ID of the echo app
 * @param ownerId - The ID of the owner
 * @returns Owner echo app with owner details and owner statistics
 */
export async function getOwnerEchoApp(
  id: string,
  ownerId: string
): Promise<OwnerEchoApp> {
  // Use a transaction to ensure consistency
  return await db.$transaction(async tx => {
    // Get the base echo app with owner-specific fields
    const echoApp = await tx.echoApp.findUnique({
      where: { id },
      include: {
        markUp: true,
        githubLink: true,
        currentReferralReward: {
          select: {
            id: true,
            amount: true,
            description: true,
          },
        },
      },
    });

    if (!echoApp) {
      throw new Error('Echo app not found');
    }

    // Get owner details
    const owner = await getOwnerDetails(id, tx);
    if (!owner) {
      throw new Error('Echo app owner not found');
    }

    // Verify that the requesting user is actually the owner
    if (owner.id !== ownerId) {
      throw new Error('User is not the owner of this echo app');
    }

    // Get owner statistics (includes global, personal, and owner-specific stats)
    const stats = await getOwnerStatistics(id, ownerId, tx);

    // Construct and return the owner echo app
    // The type system will handle the correct shape based on OwnerEchoApp type
    return {
      ...echoApp,
      markUp: echoApp.markUp
        ? {
            ...echoApp.markUp,
            amount: Number(echoApp.markUp.amount),
          }
        : null,
      owner,
      stats,
      type: 'owner',
    } as OwnerEchoApp;
  });
}

/**
 * Get all owner echo apps for a specific user with their details in a single batch operation
 * This fetches all apps where the user is the owner with full owner-level statistics
 * @param ownerId - The ID of the owner
 * @returns Array of all owner echo apps with owner details and statistics
 */
export async function getAllOwnerEchoApps(
  ownerId: string
): Promise<OwnerEchoApp[]> {
  // Use a transaction to ensure consistency
  return await db.$transaction(async tx => {
    // Step 1: Get all app memberships where user is owner
    const ownerMemberships = await tx.appMembership.findMany({
      where: {
        userId: ownerId,
        role: 'owner',
        isArchived: false,
      },
      select: {
        echoAppId: true,
      },
    });

    if (ownerMemberships.length === 0) {
      return [];
    }

    const appIds = ownerMemberships.map(m => m.echoAppId);

    // Step 2: Get all echo apps where user is owner with owner-specific fields
    const echoApps = await tx.echoApp.findMany({
      where: {
        id: { in: appIds },
        isArchived: false,
      },
      include: {
        markUp: true,
        githubLink: true,
      },
    });

    if (echoApps.length === 0) {
      return [];
    }

    // Step 3: Batch fetch owner details for all apps (should all be the same user)
    const ownersMap = await getOwnerDetailsBatch(appIds, tx);

    // Step 4: Batch fetch owner statistics for all apps
    const statsMap = await getOwnerStatisticsBatch(appIds, ownerId, tx);

    // Step 5: Combine all data
    const ownerApps: OwnerEchoApp[] = [];

    for (const echoApp of echoApps) {
      const owner = ownersMap.get(echoApp.id);
      const stats = statsMap.get(echoApp.id);

      // Skip apps without owner or stats (shouldn't happen but defensive)
      if (!owner || !stats) {
        console.error(`Missing owner or stats for app ${echoApp.id}`);
        continue;
      }

      // Verify that the requesting user is actually the owner
      if (owner.id !== ownerId) {
        console.error(`User ${ownerId} is not the owner of app ${echoApp.id}`);
        continue;
      }

      ownerApps.push({
        ...echoApp,
        markUp: echoApp.markUp
          ? {
              ...echoApp.markUp,
              amount: Number(echoApp.markUp.amount),
            }
          : null,
        owner,
        stats,
        type: 'owner',
      } as OwnerEchoApp);
    }

    return ownerApps;
  });
}
