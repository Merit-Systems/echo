import { db } from '../db';
import { withTransaction } from '../transaction-utils';
import { AppRole, MembershipStatus } from '../permissions/types';
import { PermissionService } from '../permissions/service';
import { Permission } from '../permissions/types';
import { softDeleteEchoApp } from '../soft-delete';
import {
  PublicEchoApp,
  CustomerEchoApp,
  OwnerEchoApp,
  AppCreateInput,
  AppUpdateInput,
  GlobalStatistics,
} from './types';
import {
  validateAppDescription,
  validateAppName,
  validateGithubId,
  validateGithubType,
  validateHomepageUrl,
} from './utils';
import {
  fetchAppWithOwner,
  fetchGlobalAppStatistics,
  fetchPersonalAppStatistics,
  fetchOwnerAppStatistics,
} from './statistics';

export const getPublicAppInfo = async (
  appId: string
): Promise<PublicEchoApp> => {
  return withTransaction(async tx => {
    // Fetch app with owner information
    const { app, owner } = await fetchAppWithOwner(
      appId,
      {
        requirePublic: true,
        includeOwnerEmail: false, // Don't expose email for public apps
      },
      tx
    );

    // Fetch global statistics
    const { transactionStats, modelUsage, revenue, activity } =
      await fetchGlobalAppStatistics(appId);

    const globalStats: GlobalStatistics = {
      globalTotalTransactions: transactionStats.count,
      globalTotalRevenue: revenue,
      globalTotalModelCost: transactionStats.cost,
      globalTotalTokens: transactionStats.totalTokens,
      globalTotalInputTokens: transactionStats.inputTokens,
      globalTotalOutputTokens: transactionStats.outputTokens,
      globalActivityData: activity,
      globalModelUsage: modelUsage,
    };

    return {
      ...app,
      owner: {
        ...owner,
        email: '', // Don't expose email for public apps
        profilePictureUrl: owner.profilePictureUrl || null,
      },
      stats: globalStats,
    };
  });
};

export const getDetailedAppInfo = async (
  appId: string,
  userId: string
): Promise<CustomerEchoApp | OwnerEchoApp> => {
  return withTransaction(async tx => {
    // Get user's role for this app to determine what data to show
    const userRole = await PermissionService.getUserAppRole(userId, appId);

    // If user has PUBLIC role, throw error - public users should use getPublicAppInfo
    if (userRole === AppRole.PUBLIC) {
      throw new Error('Public users should use getPublicAppInfo function');
    }

    // Fetch app with owner information
    const { app, owner } = await fetchAppWithOwner(
      appId,
      {
        includeOwnerEmail: true,
        includeConfig: true, // Include currentMarkupId and authorizedCallbackUrls
      },
      tx
    );

    if (userRole === AppRole.CUSTOMER) {
      // Return CustomerEchoApp
      const {
        transactionStats,
        modelUsage,
        recentTransactions,
        apiKeys,
        revenue,
        activity,
      } = await fetchPersonalAppStatistics(appId, userId);

      // Also fetch global statistics for customers
      const {
        transactionStats: globalTransactionStats,
        modelUsage: globalModelUsage,
        revenue: globalRevenue,
        activity: globalActivity,
      } = await fetchGlobalAppStatistics(appId);

      // Create customer app without restricted fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { currentMarkupId, authorizedCallbackUrls, ...customerApp } = app;

      return {
        ...customerApp,
        owner,
        stats: {
          personalTotalRevenue: revenue,
          personalTotalModelCost: transactionStats.cost,
          personalTotalTokens: transactionStats.totalTokens,
          personalTotalInputTokens: transactionStats.inputTokens,
          personalTotalOutputTokens: transactionStats.outputTokens,
          personalRecentTransactions: recentTransactions,
          personalModelUsage: modelUsage,
          personalActivityData: activity,
          personalApiKeys: apiKeys,
          // Include global statistics for customers
          globalTotalTransactions: globalTransactionStats.count,
          globalTotalRevenue: globalRevenue,
          globalTotalModelCost: globalTransactionStats.cost,
          globalTotalTokens: globalTransactionStats.totalTokens,
          globalTotalInputTokens: globalTransactionStats.inputTokens,
          globalTotalOutputTokens: globalTransactionStats.outputTokens,
          globalActivityData: globalActivity,
          globalModelUsage: globalModelUsage,
        },
      } as CustomerEchoApp;
    } else {
      // Return OwnerEchoApp
      const { global, personal, globalApiKeys } = await fetchOwnerAppStatistics(
        appId,
        userId
      );

      return {
        ...app,
        owner,
        stats: {
          // Personal stats (inherited from CustomerStatistics)
          personalTotalRevenue: personal.revenue,
          personalTotalModelCost: personal.transactionStats.cost,
          personalTotalTokens: personal.transactionStats.totalTokens,
          personalTotalInputTokens: personal.transactionStats.inputTokens,
          personalTotalOutputTokens: personal.transactionStats.outputTokens,
          personalRecentTransactions: personal.recentTransactions,
          personalModelUsage: personal.modelUsage,
          personalActivityData: personal.activity,
          personalApiKeys: personal.apiKeys,

          // Global stats (inherited from GlobalStatistics)
          globalTotalTransactions: global.transactionStats.count,
          globalTotalRevenue: global.revenue,
          globalTotalModelCost: global.transactionStats.cost,
          globalTotalTokens: global.transactionStats.totalTokens,
          globalTotalInputTokens: global.transactionStats.inputTokens,
          globalTotalOutputTokens: global.transactionStats.outputTokens,
          globalActivityData: global.activity,
          globalModelUsage: global.modelUsage,

          // Owner-specific stats
          globalApiKeys: globalApiKeys,
          recentGlobalTransactions: global.recentTransactions,
        },
      } as OwnerEchoApp;
    }
  });
};

export async function getAppInfo(
  appId: string,
  userId: string
): Promise<CustomerEchoApp | OwnerEchoApp | PublicEchoApp> {
  const userRole = await PermissionService.getUserAppRole(userId, appId);
  if (userRole === AppRole.PUBLIC) {
    return getPublicAppInfo(appId);
  } else {
    return getDetailedAppInfo(appId, userId);
  }
}

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

  return withTransaction(async tx => {
    // Verify the echo app exists and is not archived
    const existingApp = await tx.echoApp.findFirst({
      where: {
        id: appId,
        isArchived: false, // Only allow updating non-archived apps
      },
    });

    if (!existingApp) {
      throw new Error('Echo app not found or access denied');
    }

    // Update the app
    const updatedApp = await tx.echoApp.update({
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
  });
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

  return withTransaction(async tx => {
    // Verify the echo app exists and is not archived
    const existingApp = await tx.echoApp.findFirst({
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
  });
};

export * from './oauth';
export * from './types';
export * from './bulk-operations';
