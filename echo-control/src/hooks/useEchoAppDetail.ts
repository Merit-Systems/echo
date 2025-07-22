import { useCallback, useEffect, useState } from 'react';
import { AppRole, Permission } from '@/lib/permissions/types';
import { PermissionService } from '@/lib/permissions/service';
import { PublicEchoApp, DetailedEchoApp } from '@/lib/types/apps';

// Re-export types for backward compatibility
export type { DetailedEchoApp, EnhancedAppData } from '@/lib/types/apps';

export interface UserPermissions {
  isAuthenticated: boolean;
  userRole: AppRole | null;
  permissions: Permission[];
}

export interface UseEchoAppDetailReturn {
  app: DetailedEchoApp | null;
  loading: boolean;
  error: string | null;
  userPermissions: UserPermissions;
  refetch: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

export function useEchoAppDetail(appId: string): UseEchoAppDetailReturn {
  const [app, setApp] = useState<DetailedEchoApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    isAuthenticated: false,
    userRole: null,
    permissions: [],
  });

  // Helper function to determine user permissions based on app data
  const determineUserPermissions = (app: DetailedEchoApp): UserPermissions => {
    const roleString = app.userRole as string;
    const userRole = roleString as AppRole;
    const isAuthenticated = !!roleString && roleString !== AppRole.PUBLIC;

    // Use the centralized permission service instead of duplicating logic
    const permissions = userRole
      ? PermissionService.getPermissionsForRole(userRole)
      : [Permission.READ_APP];

    return {
      isAuthenticated,
      userRole,
      permissions,
    };
  };

  // Helper function to check if user has specific permission
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return userPermissions.permissions.includes(permission);
    },
    [userPermissions.permissions]
  );

  const fetchAppDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/apps/${appId}`);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401/403 as potential public access
        if (response.status === 401 || response.status === 403) {
          // Try to fetch public app info if available
          try {
            const publicResponse = await fetch(`/api/apps/public`);
            const publicData = await publicResponse.json();
            const publicApp = publicData.apps?.find(
              (app: PublicEchoApp) => app.id === appId
            );

            if (publicApp) {
              const appData: DetailedEchoApp = {
                ...publicApp,
                userRole: AppRole.PUBLIC,
                permissions: [Permission.READ_APP],
                description: publicApp.description || '',
                profilePictureUrl: publicApp.profilePictureUrl || '',
                bannerImageUrl: publicApp.bannerImageUrl || '',
                authorizedCallbackUrls: [], // Public users don't have access to callback URLs
                apiKeys: [],
                stats: {
                  totalTransactions: publicApp._count?.transactions || 0,
                  totalTokens: publicApp.totalTokens || 0,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                  totalCost: publicApp.totalCost || 0,
                  modelUsage: [],
                },
                recentTransactions: [],
                user: {
                  id: publicApp.owner.id,
                  email: publicApp.owner.email,
                  name: publicApp.owner.name || undefined,
                  profilePictureUrl:
                    publicApp.owner.profilePictureUrl || undefined,
                },
              };
              setApp(appData);
              setUserPermissions(determineUserPermissions(appData));
              return;
            }
          } catch (publicError) {
            console.error('Error fetching public app details:', publicError);
          }
        }
        setError(data.error || 'Failed to load app details');
        return;
      }

      setApp(data);
      setUserPermissions(determineUserPermissions(data));
    } catch (error) {
      console.error('Error fetching app details:', error);
      setError('Failed to load app details');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchAppDetails();
  }, [fetchAppDetails]);

  return {
    app,
    loading,
    error,
    userPermissions,
    refetch: fetchAppDetails,
    hasPermission,
  };
}
