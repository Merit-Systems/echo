import { db } from './db';

/**
 * Standard where clause to filter out archived records
 */
export const withoutArchived = {
  isArchived: false,
};

/**
 * Soft delete an echo app and all its related records
 */
export async function softDeleteEchoApp(appId: string) {
  const now = new Date();

  // Archive related API keys
  await db.apiKey.updateMany({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });

  // Archive related transactions
  await db.transaction.updateMany({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });

  // Archive related refresh tokens
  await db.refreshToken.updateMany({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });

  // Archive related app memberships
  await db.appMembership.updateMany({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });

  // Finally archive the app itself
  return await db.echoApp.update({
    where: { id: appId },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });
}

/**
 * Soft delete an API key
 */
export async function softDeleteApiKey(keyId: string) {
  const now = new Date();
  return await db.apiKey.update({
    where: { id: keyId },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });
}

/**
 * Soft delete a user and all their related records
 */
export async function softDeleteUser(userId: string) {
  const now = new Date();

  // First, get all the user's owned echo apps (where they are the owner)
  const userOwnedApps = await db.echoApp.findMany({
    where: {
      appMemberships: {
        some: {
          userId,
          role: 'owner',
          isArchived: false,
        },
      },
      isArchived: false,
    },
    select: { id: true },
  });

  // Archive all user's owned echo apps and their related records
  for (const app of userOwnedApps) {
    await softDeleteEchoApp(app.id);
  }

  // Archive the user's memberships in other apps
  await db.appMembership.updateMany({
    where: {
      userId,
      isArchived: false,
    },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });

  // Archive any remaining user records that weren't caught by app deletion
  await db.apiKey.updateMany({
    where: {
      userId,
      isArchived: false,
    },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });

  await db.payment.updateMany({
    where: {
      userId,
      isArchived: false,
    },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });

  await db.transaction.updateMany({
    where: {
      userId,
      isArchived: false,
    },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });

  await db.refreshToken.updateMany({
    where: {
      userId,
      isArchived: false,
    },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });

  // Finally archive the user
  return await db.user.update({
    where: { id: userId },
    data: {
      isArchived: true,
      archivedAt: now,
    },
  });
}

/**
 * Restore an archived echo app
 */
export async function restoreEchoApp(appId: string) {
  return await db.echoApp.update({
    where: { id: appId },
    data: {
      isArchived: false,
      archivedAt: null,
    },
  });
}

/**
 * Restore an archived API key
 */
export async function restoreApiKey(keyId: string) {
  return await db.apiKey.update({
    where: { id: keyId },
    data: {
      isArchived: false,
      archivedAt: null,
    },
  });
}

/**
 * Common query filters for non-archived records
 */
export const nonArchivedFilters = {
  user: { isArchived: false },
  echoApp: { isArchived: false },
  apiKey: { isArchived: false },
  payment: { isArchived: false },
  transaction: { isArchived: false },
} as const;
