import { EchoApp, Prisma } from '@/generated/prisma';
import { db } from '../db';
import { AppRole, MembershipStatus } from '../permissions/types';
import { PermissionService } from '../permissions/service';
import { Permission } from '../permissions/types';
import { softDeleteEchoApp } from '../soft-delete';

// Types for better type safety
export interface AppCreateInput {
  name: string;
  description?: string;
  githubType?: 'user' | 'repo';
  githubId?: string;
  authorizedCallbackUrls?: string[];
}

export interface AppUpdateInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  githubType?: 'user' | 'repo';
  githubId?: string;
  maxPerUserPoolSpendAmount?: number;
}

export interface AppWithDetails {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  authorizedCallbackUrls: string[];
  userRole: AppRole;
  totalTokens: number;
  totalCost: number;
  _count: {
    apiKeys: number;
    llmTransactions: number;
  };
}

export interface DetailedAppInfo {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorizedCallbackUrls: string[];
  userRole: AppRole;
  apiKeys: Array<{
    id: string;
    name: string | null;
    isActive: boolean;
    createdAt: Date;
    lastUsed: Date | null;
    totalSpent: number;
    creator: {
      email: string;
      name: string | null;
    };
  }>;
  stats: {
    totalTransactions: number;
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    modelUsage: Array<{
      model: string;
      _count: number;
      _sum: {
        totalTokens: number;
        cost: number;
      };
    }>;
  };
  recentTransactions: Array<{
    id: string;
    model: string;
    totalTokens: number;
    cost: number;
    status: string;
    createdAt: Date;
  }>;
}

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

export const validateMaxPerUserPoolSpendAmount = (
  amount?: number
): string | null => {
  if (amount !== undefined) {
    if (typeof amount !== 'number') {
      return 'Per user pool spend amount must be a number';
    }
    if (amount < 0) {
      return 'Per user pool spend amount cannot be negative';
    }
    if (amount > 10000) {
      return 'Per user pool spend amount cannot exceed $10,000';
    }
  }
  return null;
};

// Business logic functions
export const listAppsWithDetails = async (
  userId: string
): Promise<AppWithDetails[]> => {
  // Use PermissionService to get accessible apps with roles
  const accessibleApps = await PermissionService.getAccessibleApps(userId);

  // Get additional data for each app (transaction stats, counts)
  const appsWithDetails = await Promise.all(
    accessibleApps.map(async ({ app, userRole }) => {
      // Get counts for API keys and transactions
      const counts = await db.echoApp.findUnique({
        where: { id: app.id },
        select: {
          _count: {
            select: {
              apiKeys: {
                where: { isActive: true, isArchived: false },
              },
              llmTransactions: {
                where: { isArchived: false },
              },
            },
          },
        },
      });

      // Get transaction totals
      const transactionStats = await db.llmTransaction.aggregate({
        where: {
          echoAppId: app.id,
          isArchived: false,
        },
        _sum: {
          totalTokens: true,
          cost: true,
        },
      });

      return {
        id: app.id,
        name: app.name,
        description: app.description,
        isActive: app.isActive,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        authorizedCallbackUrls: app.authorizedCallbackUrls,
        userRole,
        totalTokens: transactionStats._sum.totalTokens || 0,
        totalCost: Number(transactionStats._sum.cost || 0),
        _count: {
          apiKeys: counts?._count.apiKeys || 0,
          llmTransactions: counts?._count.llmTransactions || 0,
        },
      };
    })
  );

  return appsWithDetails;
};

export const getDetailedAppInfo = async (
  appId: string,
  userId: string
): Promise<DetailedAppInfo> => {
  // Check if user has permission to read this app
  const hasPermission = await PermissionService.hasPermission(
    userId,
    appId,
    Permission.READ_APP
  );

  if (!hasPermission) {
    throw new Error('Echo app not found or access denied');
  }

  // Get user's role for this app to determine what data to show
  const userRole = await PermissionService.getUserAppRole(userId, appId);

  if (!userRole) {
    throw new Error('Echo app not found or access denied');
  }

  // Find the app
  const app = await db.echoApp.findFirst({
    where: {
      id: appId,
      isArchived: false,
    },
    include: {
      apiKeys: {
        where: {
          isArchived: false,
          // Customers can only see their own API keys
          ...(userRole === AppRole.CUSTOMER && { userId }),
        },
        select: {
          id: true,
          name: true,
          isActive: true,
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
          llmTransactions: {
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

  // Get aggregated statistics for the app (filtered by user for customers)
  const stats = await db.llmTransaction.aggregate({
    where: {
      echoAppId: appId,
      isArchived: false,
      // Filter by user for customers
      ...(userRole === AppRole.CUSTOMER && { userId }),
    },
    _count: true,
    _sum: {
      totalTokens: true,
      inputTokens: true,
      outputTokens: true,
      cost: true,
    },
  });

  // Get model usage breakdown (filtered by user for customers)
  const modelUsage = await db.llmTransaction.groupBy({
    by: ['model'],
    where: {
      echoAppId: appId,
      isArchived: false,
      ...(userRole === AppRole.CUSTOMER && { userId }),
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

  // Get recent transactions (filtered by user for customers)
  const recentTransactions = await db.llmTransaction.findMany({
    where: {
      echoAppId: appId,
      isArchived: false,
      ...(userRole === AppRole.CUSTOMER && { userId }),
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

  // Calculate total spent for each API key
  const apiKeysWithSpending = await Promise.all(
    app.apiKeys.map(async apiKey => {
      // Get total spending for this API key using the new apiKeyId field
      const spendingResult = await db.llmTransaction.aggregate({
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
    userRole,
    apiKeys: apiKeysWithSpending,
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
    })),
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
      totalDeveloperSpent: 0,
      maxDeveloperSpend: 0,
      freeSpendPoolAmount: 0,
      maxPerUserPoolSpendAmount: 0,
      appMemberships: {
        create: {
          userId,
          role: AppRole.OWNER,
          status: MembershipStatus.ACTIVE,
          isArchived: false,
          totalSpent: 0,
          freeSpendPoolSpent: 0,
        },
      },
      isActive: true,
      authorizedCallbackUrls: data.authorizedCallbackUrls || [], // Start with empty callback URLs
    },
    select: {
      id: true,
      name: true,
      description: true,
      githubType: true,
      githubId: true,
      isActive: true,
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

  if (data.maxPerUserPoolSpendAmount !== undefined) {
    const maxPerUserPoolSpendAmountError = validateMaxPerUserPoolSpendAmount(
      data.maxPerUserPoolSpendAmount
    );
    if (maxPerUserPoolSpendAmountError) {
      throw new Error(maxPerUserPoolSpendAmountError);
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
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.githubType !== undefined && { githubType: data.githubType }),
      ...(data.githubId !== undefined && {
        githubId: data.githubId?.trim() || null,
      }),
      ...(data.maxPerUserPoolSpendAmount !== undefined && {
        maxPerUserPoolSpendAmount: data.maxPerUserPoolSpendAmount,
      }),
    },
    include: {
      apiKeys: {
        select: {
          id: true,
          name: true,
          isActive: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          apiKeys: true,
          llmTransactions: true,
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
      markUp: true,
      githubId: true,
      githubType: true,
      isActive: true,
      authorizedCallbackUrls: true,
      isArchived: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
      totalDeveloperSpent: true,
      maxDeveloperSpend: true,
      freeSpendPoolAmount: true,
      maxPerUserPoolSpendAmount: true,
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
