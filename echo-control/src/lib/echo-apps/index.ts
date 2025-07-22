import { EchoApp, Prisma } from '@/generated/prisma';
import { db } from '../db';
import { AppRole, MembershipStatus } from '../permissions/types';
import { PermissionService } from '../permissions/service';
import { Permission } from '../permissions/types';
import { softDeleteEchoApp } from '../soft-delete';
import {
  getAppActivity,
  transformActivityToChartData,
} from './activity/activity';
import { isValidUrl } from '../stripe/payment-link';
import { DetailedEchoApp, PublicEchoApp } from '../types/apps';
import { AppCreateInput, AppUpdateInput, AppWithDetails } from './types';

// Validation functions
export const validateAppName = (name: string): string | null => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return 'App name is required';
  }
  if (name.length > 100) {
    return 'App name must be 100 characters or less';
  }
  return null;
};

export const validateAppDescription = (description?: string): string | null => {
  if (description && typeof description !== 'string') {
    return 'Description must be a string';
  }
  if (description && description.length > 500) {
    return 'Description must be 500 characters or less';
  }
  return null;
};

export const validateGithubId = (githubId?: string): string | null => {
  if (githubId && typeof githubId !== 'string') {
    return 'GitHub ID must be a string';
  }
  if (githubId && githubId.trim().length === 0) {
    return 'GitHub ID cannot be empty if provided';
  }
  if (githubId && githubId.length > 200) {
    return 'GitHub ID must be 200 characters or less';
  }
  return null;
};

export const validateGithubType = (githubType?: string): string | null => {
  if (githubType && !['user', 'repo'].includes(githubType)) {
    return 'GitHub Type must be either "user" or "repo"';
  }
  return null;
};

export const validateHomepageUrl = (homepageUrl?: string): string | null => {
  if (homepageUrl && typeof homepageUrl !== 'string') {
    return 'Homepage URL must be a string';
  }
  if (homepageUrl && homepageUrl.trim().length === 0) {
    return 'Homepage URL cannot be empty if provided';
  }
  if (homepageUrl && homepageUrl.length > 500) {
    return 'Homepage URL must be 500 characters or less';
  }
  if (homepageUrl) {
    try {
      const url = new URL(homepageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Homepage URL must start with http:// or https://';
      }
    } catch {
      return 'Homepage URL must be a valid URL';
    }
  }
  return null;
};

export const verifyArgs = (data: {
  name?: string;
  description?: string;
  githubType?: string;
  githubId?: string;
  authorizedCallbackUrls?: string[];
  profilePictureUrl?: string;
  bannerImageUrl?: string;
  homepageUrl?: string;
  isPublic?: boolean;
}): string | null => {
  // Validate name
  if (data.name !== undefined) {
    const nameError = validateAppName(data.name);
    if (nameError) return nameError;
  }

  // Validate description
  if (data.description !== undefined) {
    const descriptionError = validateAppDescription(data.description);
    if (descriptionError) return descriptionError;
  }

  // Validate githubType
  if (data.githubType !== undefined) {
    const githubTypeError = validateGithubType(data.githubType);
    if (githubTypeError) return githubTypeError;
  }

  // Validate githubId
  if (data.githubId !== undefined) {
    const githubIdError = validateGithubId(data.githubId);
    if (githubIdError) return githubIdError;
  }

  // Validate authorizedCallbackUrls
  if (data.authorizedCallbackUrls !== undefined) {
    if (!Array.isArray(data.authorizedCallbackUrls)) {
      return 'Authorized callback URLs must be an array';
    }

    for (const url of data.authorizedCallbackUrls) {
      if (typeof url !== 'string') {
        return 'All callback URLs must be strings';
      }

      if (url.trim().length === 0) {
        return 'Callback URLs cannot be empty';
      }

      // Allow localhost URLs for development
      const isLocalhostUrl = url.startsWith('http://localhost:');
      if (!isLocalhostUrl && !isValidUrl(url)) {
        return `Invalid callback URL: ${url}`;
      }
    }
  }

  // Validate profilePictureUrl
  if (data.profilePictureUrl !== undefined && data.profilePictureUrl !== null) {
    if (typeof data.profilePictureUrl !== 'string') {
      return 'Profile picture URL must be a string';
    }

    if (data.profilePictureUrl.trim().length === 0) {
      return 'Profile picture URL cannot be empty if provided';
    }

    if (!isValidUrl(data.profilePictureUrl)) {
      return 'Profile picture URL must be a valid URL';
    }
  }

  // Validate bannerImageUrl
  if (data.bannerImageUrl !== undefined && data.bannerImageUrl !== null) {
    if (typeof data.bannerImageUrl !== 'string') {
      return 'Banner image URL must be a string';
    }

    if (data.bannerImageUrl.trim().length === 0) {
      return 'Banner image URL cannot be empty if provided';
    }

    if (!isValidUrl(data.bannerImageUrl)) {
      return 'Banner image URL must be a valid URL';
    }
  }

  // Validate homepageUrl
  if (data.homepageUrl !== undefined) {
    const homepageUrlError = validateHomepageUrl(data.homepageUrl);
    if (homepageUrlError) return homepageUrlError;
  }

  // Validate isPublic
  if (data.isPublic !== undefined) {
    if (typeof data.isPublic !== 'boolean') {
      return 'isPublic must be a boolean';
    }
  }

  return null; // No validation errors
};

// Business logic functions
export const listAppsWithDetails = async (
  userId: string,
  role?: AppRole
): Promise<AppWithDetails[]> => {
  // Get user's accessible apps with memberships in a single query
  const userMemberships = await db.appMembership.findMany({
    where: {
      userId,
      status: MembershipStatus.ACTIVE,
      isArchived: false,
      ...(role && { role }),
    },
    include: {
      echoApp: {
        include: {
          // Include the owner membership and their user details
          appMemberships: {
            where: {
              role: AppRole.OWNER,
              isArchived: false,
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  profilePictureUrl: true,
                },
              },
              echoApp: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  profilePictureUrl: true,
                  bannerImageUrl: true,
                },
              },
            },
            take: 1, // There should only be one owner
          },
          _count: {
            select: {
              apiKeys: {
                where: { isArchived: false },
              },
              transactions: {
                where: { isArchived: false },
              },
            },
          },
        },
      },
    },
  });

  // Get transaction totals for all apps in batch
  const appIds = userMemberships.map(m => m.echoApp.id);
  const transactionStats = await db.transaction.groupBy({
    by: ['echoAppId'],
    where: {
      echoAppId: { in: appIds },
      isArchived: false,
    },
    _sum: {
      totalTokens: true,
      cost: true,
    },
  });

  // Create a map for quick lookup of transaction stats
  const statsMap = new Map(
    transactionStats.map(stat => [
      stat.echoAppId,
      {
        totalTokens: stat._sum.totalTokens || 0,
        totalCost: Number(stat._sum.cost || 0),
      },
    ])
  );

  // Get activity data for all apps in batch
  const activityDataMap = new Map<string, number[]>();
  await Promise.all(
    appIds.map(async appId => {
      try {
        const activity = await getAppActivity(appId);
        const activityData = transformActivityToChartData(activity);
        activityDataMap.set(appId, activityData);
      } catch (error) {
        console.error(`Failed to fetch activity for app ${appId}:`, error);
        // Fallback to empty array if activity fetch fails
        activityDataMap.set(appId, []);
      }
    })
  );

  // Transform the results
  return userMemberships.map(membership => {
    const app = membership.echoApp;
    const owner = app.appMemberships[0]?.user || null;
    const stats = statsMap.get(app.id) || { totalTokens: 0, totalCost: 0 };
    const activityData = activityDataMap.get(app.id) || [];

    return {
      id: app.id,
      name: app.name,
      description: app.description,
      profilePictureUrl: app.profilePictureUrl,
      bannerImageUrl: app.bannerImageUrl,
      isPublic: app.isPublic || false,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      authorizedCallbackUrls: app.authorizedCallbackUrls,
      userRole: membership.role as AppRole,
      totalTokens: stats.totalTokens,
      totalCost: stats.totalCost,
      _count: {
        apiKeys: app._count.apiKeys,
        transactions: app._count.transactions,
      },
      owner: owner,
      activityData,
    };
  });
};

export const getPublicAppInfo = async (
  appId: string
): Promise<PublicEchoApp> => {
  // Find the app
  const app = await db.echoApp.findFirst({
    where: {
      id: appId,
      isArchived: false,
      // Public apps should be accessible to everyone
      isPublic: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      profilePictureUrl: true,
      bannerImageUrl: true,
      homepageUrl: true,
      githubId: true,
      githubType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!app) {
    throw new Error('Echo app not found or not publicly accessible');
  }

  // Find the owner of the app (only name, not email for privacy)
  const ownerMembership = await db.appMembership.findFirst({
    where: {
      echoAppId: appId,
      role: AppRole.OWNER,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Get full aggregated statistics for public view (always global)
  const stats = await db.transaction.aggregate({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    _count: true,
    _sum: {
      totalTokens: true,
      inputTokens: true,
      outputTokens: true,
      cost: true,
    },
  });

  // Get model usage breakdown (always global for public view)
  const modelUsage = await db.transaction.groupBy({
    by: ['model'],
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    _count: true,
    _sum: {
      totalTokens: true,
      cost: true,
    },
    orderBy: {
      _sum: {
        totalTokens: 'desc',
      },
    },
  });

  // Get recent transactions (always global for public view)
  const recentTransactions = await db.transaction.findMany({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    select: {
      id: true,
      model: true,
      totalTokens: true,
      cost: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Get activity data for the last 7 days
  const activity = await getAppActivity(appId);
  const activityData = transformActivityToChartData(activity);

  return {
    ...app,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    githubType: app.githubType as 'user' | 'repo' | null,
    isPublic: true,
    userRole: AppRole.PUBLIC,
    permissions: [Permission.READ_APP],
    totalTokens: stats._sum.totalTokens || 0,
    totalCost: Number(stats._sum.cost || 0),
    authorizedCallbackUrls: [],
    _count: {
      apiKeys: 0,
      transactions: stats._count || 0,
    },
    owner: ownerMembership?.user
      ? {
          id: ownerMembership.user.id,
          email: '', // Don't expose email for public apps
          name: ownerMembership.user.name,
          profilePictureUrl: null,
        }
      : {
          id: '',
          email: '',
          name: null,
          profilePictureUrl: null,
        },
    stats: {
      totalTransactions: stats._count || 0,
      totalTokens: stats._sum.totalTokens || 0,
      totalInputTokens: stats._sum.inputTokens || 0,
      totalOutputTokens: stats._sum.outputTokens || 0,
      totalCost: Number(stats._sum.cost || 0),
      modelUsage: modelUsage.map(usage => ({
        model: usage.model,
        _count: usage._count,
        _sum: {
          totalTokens: usage._sum.totalTokens || 0,
          cost: Number(usage._sum.cost || 0),
        },
      })),
    },
    recentTransactions: recentTransactions.map(transaction => ({
      ...transaction,
      cost: Number(transaction.cost),
      createdAt: transaction.createdAt.toISOString(),
    })),
    activityData,
  };
};

export const getDetailedAppInfo = async (
  appId: string,
  userId: string,
  globalView: boolean = false
): Promise<DetailedEchoApp> => {
  // Get user's role for this app to determine what data to show
  const userRole = await PermissionService.getUserAppRole(userId, appId);

  // If user has PUBLIC role, use the public function instead
  if (userRole === AppRole.PUBLIC) {
    const publicInfo = await getPublicAppInfo(appId);
    // Transform to match DetailedAppInfo structure for backward compatibility
    return {
      ...publicInfo,
      githubType: publicInfo.githubType as 'user' | 'repo' | null,
      isPublic: true, // Public apps are always public
      authorizedCallbackUrls: [],
      user: {
        ...publicInfo.owner,
        email: '', // Don't expose email for privacy reasons
      },
      apiKeys: [],
      stats: publicInfo.stats, // Use the full stats from public info
      recentTransactions: publicInfo.recentTransactions, // Use the actual recent transactions
    };
  }

  // Find the app
  const app = await db.echoApp.findFirst({
    where: {
      id: appId,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      description: true,
      profilePictureUrl: true,
      bannerImageUrl: true,
      homepageUrl: true,
      githubId: true,
      githubType: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      authorizedCallbackUrls: true,
      apiKeys: {
        where: {
          isArchived: false,
          // Customers can only see their own API keys
          ...(userRole === AppRole.CUSTOMER && { userId }),
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          lastUsed: true,
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          apiKeys: {
            where: {
              isArchived: false,
              ...(userRole === AppRole.CUSTOMER && { userId }),
            },
          },
          transactions: {
            where: {
              isArchived: false,
              ...(userRole === AppRole.CUSTOMER && { userId }),
            },
          },
        },
      },
    },
  });

  if (!app) {
    throw new Error('Echo app not found or access denied');
  }

  // Find the owner of the app
  const ownerMembership = await db.appMembership.findFirst({
    where: {
      echoAppId: appId,
      role: AppRole.OWNER,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
  if (!ownerMembership) {
    throw new Error('Owner not found');
  }

  // Get aggregated statistics for the app (filtered by user for customers unless globalView is true)
  const stats = await db.transaction.aggregate({
    where: {
      echoAppId: appId,
      isArchived: false,
      // Filter by user for customers unless globalView is requested
      ...(userRole === AppRole.CUSTOMER && !globalView && { userId }),
    },
    _count: true,
    _sum: {
      totalTokens: true,
      inputTokens: true,
      outputTokens: true,
      cost: true,
    },
  });

  // Get model usage breakdown (filtered by user for customers unless globalView is true)
  const modelUsage = await db.transaction.groupBy({
    by: ['model'],
    where: {
      echoAppId: appId,
      isArchived: false,
      // Filter by user for customers unless globalView is requested
      ...(userRole === AppRole.CUSTOMER && !globalView && { userId }),
    },
    _count: true,
    _sum: {
      totalTokens: true,
      cost: true,
    },
    orderBy: {
      _sum: {
        totalTokens: 'desc',
      },
    },
  });

  // Get recent transactions (filtered by user for customers unless globalView is true)
  const recentTransactions = await db.transaction.findMany({
    where: {
      echoAppId: appId,
      isArchived: false,
      // Filter by user for customers unless globalView is requested
      ...(userRole === AppRole.CUSTOMER && !globalView && { userId }),
    },
    select: {
      id: true,
      model: true,
      totalTokens: true,
      cost: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Get activity data for the last 7 days (filtered by user for customers unless globalView is true)
  const activity = await getAppActivity(
    appId,
    7,
    userRole === AppRole.CUSTOMER && !globalView ? userId : undefined
  );
  const activityData = transformActivityToChartData(activity);

  // Calculate total spent for each API key
  const apiKeysWithSpending = await Promise.all(
    app.apiKeys.map(async apiKey => {
      // Get total spending for this API key using the new apiKeyId field
      const spendingResult = await db.transaction.aggregate({
        where: {
          apiKeyId: apiKey.id,
          isArchived: false,
        },
        _sum: {
          cost: true,
        },
      });

      const totalSpent = Number(spendingResult._sum.cost || 0);

      return {
        ...apiKey,
        totalSpent,
        creator: apiKey.user,
      };
    })
  );

  return {
    ...app,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    githubType: app.githubType as 'user' | 'repo' | null,
    user: {
      id: ownerMembership.user.id,
      email: ownerMembership.user.email,
      name: ownerMembership.user.name,
      profilePictureUrl: null,
    },
    userRole,
    permissions: PermissionService.getPermissionsForRole(userRole),
    totalTokens: stats._sum.totalTokens || 0,
    totalCost: Number(stats._sum.cost || 0),
    owner: ownerMembership?.user
      ? {
          id: ownerMembership.user.id,
          email: ownerMembership.user.email,
          name: ownerMembership.user.name,
          profilePictureUrl: null,
        }
      : {
          id: '',
          email: '',
          name: null,
          profilePictureUrl: null,
        },
    _count: {
      apiKeys: app._count.apiKeys,
      transactions: app._count.transactions,
    },
    apiKeys: apiKeysWithSpending.map(key => ({
      ...key,
      name: key.name || undefined,
      createdAt: key.createdAt.toISOString(),
      lastUsed: key.lastUsed?.toISOString(),
      creator: key.creator
        ? {
            email: key.creator.email,
            name: key.creator.name || undefined,
          }
        : null,
    })),
    stats: {
      totalTransactions: stats._count || 0,
      totalTokens: stats._sum.totalTokens || 0,
      totalInputTokens: stats._sum.inputTokens || 0,
      totalOutputTokens: stats._sum.outputTokens || 0,
      totalCost: Number(stats._sum.cost || 0),
      modelUsage: modelUsage.map(usage => ({
        ...usage,
        _sum: {
          totalTokens: usage._sum.totalTokens || 0,
          cost: Number(usage._sum.cost || 0),
        },
      })),
    },
    recentTransactions: recentTransactions.map(transaction => ({
      ...transaction,
      cost: Number(transaction.cost),
      createdAt: transaction.createdAt.toISOString(),
    })),
    activityData,
  };
};

export const createEchoApp = async (userId: string, data: AppCreateInput) => {
  // Validate input
  const nameError = validateAppName(data.name);
  if (nameError) {
    throw new Error(nameError);
  }

  const descriptionError = validateAppDescription(data.description);
  if (descriptionError) {
    throw new Error(descriptionError);
  }

  const githubIdError = validateGithubId(data.githubId);
  if (githubIdError) {
    throw new Error(githubIdError);
  }

  const githubTypeError = validateGithubType(data.githubType);
  if (githubTypeError) {
    throw new Error(githubTypeError);
  }

  const echoApp = await db.echoApp.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      githubType: data.githubType || null,
      githubId: data.githubId?.trim() || null,
      appMemberships: {
        create: {
          userId,
          role: AppRole.OWNER,
          status: MembershipStatus.ACTIVE,
          isArchived: false,
          totalSpent: 0,
        },
      },
      authorizedCallbackUrls: data.authorizedCallbackUrls || [], // Start with empty callback URLs
    },
    select: {
      id: true,
      name: true,
      description: true,
      githubType: true,
      githubId: true,
      createdAt: true,
      updatedAt: true,
      authorizedCallbackUrls: true,
    },
  });

  return echoApp;
};

export const updateEchoAppById = async (
  appId: string,
  userId: string,
  data: AppUpdateInput
) => {
  // Check if user has permission to edit this app
  const hasEditPermission = await PermissionService.hasPermission(
    userId,
    appId,
    Permission.EDIT_APP
  );

  if (!hasEditPermission) {
    throw new Error('Echo app not found or access denied');
  }

  // Validate input if provided
  if (data.name !== undefined) {
    const nameError = validateAppName(data.name);
    if (nameError) {
      throw new Error(nameError);
    }
  }

  if (data.description !== undefined) {
    const descriptionError = validateAppDescription(data.description);
    if (descriptionError) {
      throw new Error(descriptionError);
    }
  }

  if (data.githubId !== undefined) {
    const githubIdError = validateGithubId(data.githubId);
    if (githubIdError) {
      throw new Error(githubIdError);
    }
  }

  if (data.githubType !== undefined) {
    const githubTypeError = validateGithubType(data.githubType);
    if (githubTypeError) {
      throw new Error(githubTypeError);
    }
  }

  if (data.homepageUrl !== undefined) {
    const homepageUrlError = validateHomepageUrl(data.homepageUrl);
    if (homepageUrlError) {
      throw new Error(homepageUrlError);
    }
  }

  // Verify the echo app exists and is not archived
  const existingApp = await db.echoApp.findFirst({
    where: {
      id: appId,
      isArchived: false, // Only allow updating non-archived apps
    },
  });

  if (!existingApp) {
    throw new Error('Echo app not found or access denied');
  }

  // Update the app
  const updatedApp = await db.echoApp.update({
    where: { id: appId },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && {
        description: data.description?.trim() || null,
      }),
      ...(data.githubType !== undefined && { githubType: data.githubType }),
      ...(data.githubId !== undefined && {
        githubId: data.githubId?.trim() || null,
      }),
      ...(data.profilePictureUrl !== undefined && {
        profilePictureUrl: data.profilePictureUrl?.trim() || null,
      }),
      ...(data.bannerImageUrl !== undefined && {
        bannerImageUrl: data.bannerImageUrl?.trim() || null,
      }),
      ...(data.homepageUrl !== undefined && {
        homepageUrl: data.homepageUrl?.trim() || null,
      }),
      ...(data.authorizedCallbackUrls !== undefined && {
        authorizedCallbackUrls: data.authorizedCallbackUrls,
      }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
    },
    include: {
      apiKeys: {
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          apiKeys: true,
          transactions: true,
        },
      },
    },
  });

  return updatedApp;
};

export const deleteEchoAppById = async (appId: string, userId: string) => {
  // Check if user has permission to delete this app
  const hasDeletePermission = await PermissionService.hasPermission(
    userId,
    appId,
    Permission.DELETE_APP
  );

  if (!hasDeletePermission) {
    throw new Error('Echo app not found or access denied');
  }

  // Verify the echo app exists and is not archived
  const existingApp = await db.echoApp.findFirst({
    where: {
      id: appId,
      isArchived: false, // Only allow archiving non-archived apps
    },
  });

  if (!existingApp) {
    throw new Error('Echo app not found or access denied');
  }

  // Soft delete the echo app and all related records
  await softDeleteEchoApp(appId);

  return {
    success: true,
    message: 'Echo app and related data archived successfully',
  };
};

// Legacy functions for backward compatibility
export const findEchoApp = async (
  id: string,
  userId: string
): Promise<EchoApp | null> => {
  const echoApp = await db.echoApp.findFirst({
    where: {
      id,
      appMemberships: {
        some: {
          userId,
          status: MembershipStatus.ACTIVE,
          isArchived: false,
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      profilePictureUrl: true,
      bannerImageUrl: true,
      homepageUrl: true,
      currentMarkupId: true,
      currentMarkup: true,
      githubId: true,
      githubType: true,
      isPublic: true,
      authorizedCallbackUrls: true,
      isArchived: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return echoApp;
};

export const updateEchoApp = async (
  id: string,
  userId: string,
  data: Prisma.EchoAppUpdateInput,
  select?: Prisma.EchoAppSelect
): Promise<EchoApp> => {
  const echoApp = await findEchoApp(id, userId);

  if (!echoApp) {
    throw new Error('Echo app not found');
  }

  return db.echoApp.update({
    where: { id },
    data,
    select,
  });
};

export * from './apps';
export * from './types';
