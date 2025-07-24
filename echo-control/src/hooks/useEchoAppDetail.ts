import { useCallback, useEffect, useState } from 'react';
import { AppRole, Permission } from '@/lib/permissions/types';
import { PermissionService } from '@/lib/permissions/service';
import {
  PublicEchoApp,
  CustomerEchoApp,
  OwnerEchoApp,
} from '@/lib/echo-apps/types';

export interface UserPermissions {
  isAuthenticated: boolean;
  userRole: AppRole | null;
  permissions: Permission[];
}

export interface UseEchoAppDetailReturn {
  app: PublicEchoApp | CustomerEchoApp | OwnerEchoApp | null;
  loading: boolean;
  error: string | null;
  userPermissions: UserPermissions;
  refetch: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

export function useEchoAppDetail(appId: string): UseEchoAppDetailReturn {
  const [app, setApp] = useState<
    PublicEchoApp | CustomerEchoApp | OwnerEchoApp | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    isAuthenticated: false,
    userRole: null,
    permissions: [],
  });

  // Helper function to determine user permissions based on app data and context
  const determineUserPermissions = (
    appType: 'public' | 'customer' | 'owner'
  ): UserPermissions => {
    let userRole: AppRole;
    let isAuthenticated: boolean;

    switch (appType) {
      case 'public':
        userRole = AppRole.PUBLIC;
        isAuthenticated = false;
        break;
      case 'customer':
        userRole = AppRole.CUSTOMER;
        isAuthenticated = true;
        break;
      case 'owner':
        userRole = AppRole.OWNER;
        isAuthenticated = true;
        break;
    }

    const permissions = PermissionService.getPermissionsForRole(userRole);

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
              setApp(publicApp);
              setUserPermissions(determineUserPermissions('public'));
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

      // Determine the app type based on the statistics structure
      let appType: 'public' | 'customer' | 'owner';
      if (
        'globalTotalTransactions' in data.stats &&
        'personalTotalRevenue' in data.stats
      ) {
        // Has both global and personal stats - this is an owner view
        appType = 'owner';
      } else if ('personalTotalRevenue' in data.stats) {
        // Has personal stats but no global stats - this is a customer view
        appType = 'customer';
      } else {
        // Only has global stats - this is a public view
        appType = 'public';
      }

      setUserPermissions(determineUserPermissions(appType));
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
