import { db } from '@/lib/db';
import type { UserAppAccess } from './types';
import { AppRole, MembershipStatus, Permission } from './types';
import type { EchoApp, AppMembership } from '@/generated/prisma';
import { logger } from '@/logger';

export class PermissionService {
  private static rolePermissions: Record<AppRole, Permission[]> = {
    [AppRole.OWNER]: [
      Permission.READ_APP,
      Permission.EDIT_APP,
      Permission.DELETE_APP,
      Permission.MANAGE_CUSTOMERS,
      Permission.INVITE_CUSTOMERS,
      Permission.CREATE_API_KEYS,
      Permission.MANAGE_ALL_API_KEYS,
      Permission.MANAGE_BILLING,
      Permission.VIEW_ANALYTICS,
      Permission.USE_LLM_API,
    ],
    [AppRole.ADMIN]: [
      Permission.READ_APP,
      Permission.EDIT_APP,
      Permission.INVITE_CUSTOMERS,
      Permission.CREATE_API_KEYS,
      Permission.MANAGE_ALL_API_KEYS,
      Permission.VIEW_ANALYTICS,
      Permission.USE_LLM_API,
    ],
    [AppRole.CUSTOMER]: [
      Permission.READ_APP,
      Permission.MANAGE_OWN_API_KEYS,
      Permission.VIEW_OWN_USAGE,
      Permission.USE_LLM_API,
    ],
    [AppRole.PUBLIC]: [Permission.READ_APP],
  };

  static async getUserAppRole(userId: string, appId: string): Promise<AppRole> {
    // Check app membership
    const membership = await db.appMembership.findFirst({
      where: {
        userId,
        echoAppId: appId,
        status: MembershipStatus.ACTIVE,
        isArchived: false,
      },
    });

    const role = membership ? (membership.role as AppRole) : AppRole.PUBLIC;

    logger.emit({
      severityText: 'DEBUG',
      body: 'Retrieved user app role',
      attributes: {
        userId,
        appId,
        role,
        hasMembership: !!membership,
        function: 'getUserAppRole',
      },
    });

    return role;
  }

  static async hasPermission(
    userId: string,
    appId: string,
    permission: Permission
  ): Promise<boolean> {
    const role = await this.getUserAppRole(userId, appId);
    if (!role) {
      logger.emit({
        severityText: 'WARN',
        body: 'Permission check failed - no role found',
        attributes: {
          userId,
          appId,
          permission,
          function: 'hasPermission',
        },
      });
      return false;
    }

    const rolePermissions = this.rolePermissions[role];
    const hasAccess = rolePermissions.includes(permission);

    logger.emit({
      severityText: hasAccess ? 'INFO' : 'WARN',
      body: hasAccess ? 'Permission granted' : 'Permission denied',
      attributes: {
        userId,
        appId,
        permission,
        role,
        hasAccess,
        function: 'hasPermission',
      },
    });

    return hasAccess;
  }

  static async getUserAppAccess(
    userId: string,
    appId: string
  ): Promise<UserAppAccess | null> {
    const role = await this.getUserAppRole(userId, appId);
    if (!role) return null;

    return {
      userId,
      appId,
      role,
      status: MembershipStatus.ACTIVE,
      permissions: this.rolePermissions[role],
    };
  }

  static async getAccessibleApps(
    userId: string,
    role?: AppRole
  ): Promise<Array<{ app: EchoApp; userRole: AppRole }>> {
    const results: Array<{ app: EchoApp; userRole: AppRole }> = [];
    // Get membership apps
    const memberships = await db.appMembership.findMany({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
        isArchived: false,
        ...(role && { role }),
      },
      include: { echoApp: true },
    });

    results.push(
      ...memberships.map((m: AppMembership & { echoApp: EchoApp }) => ({
        app: m.echoApp,
        userRole: m.role as AppRole,
      }))
    );

    logger.emit({
      severityText: 'INFO',
      body: 'Retrieved accessible apps for user',
      attributes: {
        userId,
        requestedRole: role,
        appCount: results.length,
        function: 'getAccessibleApps',
      },
    });

    return results;
  }

  /**
   * Get permissions for a specific role (for frontend components)
   */
  static getPermissionsForRole(role: AppRole): Permission[] {
    return this.rolePermissions[role] || [];
  }

  /**
   * Check if a role has a specific permission (for frontend components)
   */
  static roleHasPermission(role: AppRole, permission: Permission): boolean {
    const permissions = this.getPermissionsForRole(role);
    return permissions.includes(permission);
  }
}
