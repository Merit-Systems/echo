import { PermissionService } from '@/lib/permissions';
import { AppRole } from '@/lib/permissions/types';
import { getOwnerEchoApp } from './owner';
import { getCustomerEchoApp } from './customer';
import { getPublicEchoApp } from './public';
import type { OwnerEchoApp, CustomerEchoApp, PublicEchoApp } from './types';

/**
 * Get an app with the appropriate level of detail based on user permissions.
 * Checks the user's role on the app and returns the correct data structure:
 * - Owner: Full app details with owner statistics and management data
 * - Customer: App details with customer statistics
 * - Public: Basic app details with global statistics only
 *
 * @param appId - The ID of the app to fetch
 * @param userId - The ID of the user requesting the app (optional for public access)
 * @returns The app data appropriate for the user's permission level
 */
export async function getApp(
  appId: string,
  userId?: string
): Promise<OwnerEchoApp | CustomerEchoApp | PublicEchoApp> {
  // If no userId provided, return public view
  if (!userId) {
    return getPublicEchoApp(appId);
  }

  // Get the user's role for this app
  const role = await PermissionService.getUserAppRole(userId, appId);

  // Return the appropriate app data based on role
  switch (role) {
    case AppRole.OWNER:
      return getOwnerEchoApp(appId, userId);

    case AppRole.ADMIN:
    case AppRole.CUSTOMER:
      // Both admin and customer get the customer view
      // (admin role might be expanded in the future)
      return getCustomerEchoApp(appId, userId);

    case AppRole.PUBLIC:
    default:
      return getPublicEchoApp(appId);
  }
}
