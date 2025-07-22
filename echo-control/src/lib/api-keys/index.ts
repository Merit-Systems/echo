import { ApiKey, Prisma, User } from '@/generated/prisma';
import { db } from '../db';
import { AppRole, Permission } from '../permissions/types';
import { PermissionService } from '../permissions';
import { generateApiKey, hashApiKey } from '../crypto';

export * from './api-keys';

export async function findApiKey(
  id: string,
  userId: string
): Promise<ApiKey | null> {
  return db.apiKey.findFirst({
    where: {
      id,
      userId,
      isArchived: false,
    },
  });
}

export async function updateApiKey(
  id: string,
  userId: string,
  data: Prisma.ApiKeyUpdateInput
): Promise<ApiKey> {
  return db.apiKey.update({
    where: { id, userId },
    data,
  });
}

export async function getApiKeys(user: User): Promise<ApiKey[]> {
  // Get all API keys user has access to
  const accessibleApps = await PermissionService.getAccessibleApps(user.id);
  const appIds = accessibleApps.map(({ app }) => app.id);

  const apiKeys = await db.apiKey.findMany({
    where: {
      echoAppId: { in: appIds },
      isArchived: false,
      echoApp: {
        isArchived: false,
      },
    },
    include: {
      echoApp: true,
      user: {
        select: { id: true, email: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Filter keys based on permissions
  const filteredKeys = apiKeys.filter(key => {
    const appAccess = accessibleApps.find(
      ({ app }) => app.id === key.echoAppId
    );
    if (!appAccess) return false;

    // Owners can see all keys for their apps
    if (appAccess.userRole === AppRole.OWNER) return true;

    // Customers can only see their own keys
    if (appAccess.userRole === AppRole.CUSTOMER) {
      return key.userId === user.id;
    }

    // Admins can see all keys
    if (appAccess.userRole === AppRole.ADMIN) return true;

    return false;
  });

  return filteredKeys;
}

export async function createApiKey(
  user: User,
  echoAppId: string,
  name: string
): Promise<ApiKey> {
  // Check permissions using the new permission system
  const hasCreatePermission = await PermissionService.hasPermission(
    user.id,
    echoAppId,
    Permission.CREATE_API_KEYS
  );

  const hasManageOwnPermission = await PermissionService.hasPermission(
    user.id,
    echoAppId,
    Permission.MANAGE_OWN_API_KEYS
  );

  if (!hasCreatePermission && !hasManageOwnPermission) {
    throw new Error('Permission denied');
  }

  const userRole = await PermissionService.getUserAppRole(user.id, echoAppId);
  const scope =
    userRole === AppRole.OWNER || userRole === AppRole.ADMIN
      ? 'owner'
      : 'customer';

  // Generate a new API key
  const generatedKey = generateApiKey();

  // Hash the API key for secure storage (deterministic for O(1) lookup)
  const keyHash = hashApiKey(generatedKey);

  // Create the API key
  const apiKey = await db.apiKey.create({
    data: {
      keyHash,
      name: name || 'API Key',
      userId: user.id,
      echoAppId,
      scope,
    },
    include: {
      echoApp: true,
    },
  });

  // Return the API key with the original plaintext key for the user to save
  const response = {
    ...apiKey,
    key: generatedKey, // Include the plaintext key in the response for the user to copy
  };

  return response;
}
