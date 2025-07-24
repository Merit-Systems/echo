import { withTransaction, DbContext, getDbContext } from '../transaction-utils';
import { AppRole } from '../permissions/types';
import {
  PublicEchoApp,
  CustomerEchoApp,
  OwnerEchoApp,
  GlobalStatistics,
  ModelUsage,
  CustomerApiKey,
} from './types';
import { getTotalRevenueForApps } from '../revenue';
import { getAppActivityForApps } from './activity/activity';

/**
 * Bulk fetch apps with their owners using a single SQL query
 */
async function bulkFetchAppsWithOwners(
  appIds: string[],
  options: {
    requirePublic?: boolean;
    includeOwnerEmail?: boolean;
    includeConfig?: boolean;
  } = {},
  tx?: DbContext
) {
  const {
    requirePublic = false,
    includeOwnerEmail = false,
    includeConfig = false,
  } = options;

  const dbContext = getDbContext(tx);
  const apps = await dbContext.echoApp.findMany({
    where: {
      id: { in: appIds },
      isArchived: false,
      ...(requirePublic && { isPublic: true }),
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
      ...(includeConfig && {
        currentMarkupId: true,
        authorizedCallbackUrls: true,
      }),
      appMemberships: {
        where: {
          role: AppRole.OWNER,
          isArchived: false,
        },
        include: {
          user: {
            select: {
              id: true,
              email: includeOwnerEmail,
              name: true,
              profilePictureUrl: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  return apps.map(app => ({
    app: {
      ...app,
      githubType: app.githubType as 'user' | 'repo' | null,
    },
    owner: app.appMemberships[0]?.user
      ? {
          id: app.appMemberships[0].user.id,
          email: includeOwnerEmail ? app.appMemberships[0].user.email : '',
          name: app.appMemberships[0].user.name,
          profilePictureUrl: app.appMemberships[0].user.profilePictureUrl,
        }
      : {
          id: '',
          email: '',
          name: null,
          profilePictureUrl: null,
        },
  }));
}

/**
 * Bulk fetch global transaction statistics for multiple apps
 */
async function bulkFetchGlobalTransactionStats(
  appIds: string[],
  tx?: DbContext
) {
  const dbContext = getDbContext(tx);
  const stats = await dbContext.transaction.groupBy({
    by: ['echoAppId'],
    where: {
      echoAppId: { in: appIds },
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

  return new Map(
    stats.map(stat => [
      stat.echoAppId,
      {
        count: stat._count,
        totalTokens: stat._sum.totalTokens || 0,
        inputTokens: stat._sum.inputTokens || 0,
        outputTokens: stat._sum.outputTokens || 0,
        cost: Number(stat._sum.cost || 0),
      },
    ])
  );
}

/**
 * Bulk fetch personal transaction statistics for a user across multiple apps
 */
async function bulkFetchPersonalTransactionStats(
  appIds: string[],
  userId: string,
  tx?: DbContext
) {
  const dbContext = getDbContext(tx);
  const stats = await dbContext.transaction.groupBy({
    by: ['echoAppId'],
    where: {
      echoAppId: { in: appIds },
      userId: userId,
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

  return new Map(
    stats.map(stat => [
      stat.echoAppId,
      {
        count: stat._count,
        totalTokens: stat._sum.totalTokens || 0,
        inputTokens: stat._sum.inputTokens || 0,
        outputTokens: stat._sum.outputTokens || 0,
        cost: Number(stat._sum.cost || 0),
      },
    ])
  );
}

/**
 * Bulk fetch global model usage for multiple apps
 */
async function bulkFetchGlobalModelUsage(
  appIds: string[],
  tx?: DbContext
): Promise<Map<string, ModelUsage[]>> {
  const dbContext = getDbContext(tx);
  const modelUsage = await dbContext.transaction.groupBy({
    by: ['echoAppId', 'model'],
    where: {
      echoAppId: { in: appIds },
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

  const usageMap = new Map<string, ModelUsage[]>();

  // Group by appId
  for (const usage of modelUsage) {
    const appId = usage.echoAppId;
    if (!usageMap.has(appId)) {
      usageMap.set(appId, []);
    }

    usageMap.get(appId)!.push({
      model: usage.model,
      totalTokens: usage._sum.totalTokens || 0,
      totalModelCost: Number(usage._sum.cost || 0),
    });
  }

  return usageMap;
}

/**
 * Bulk fetch personal model usage for a user across multiple apps
 */
async function bulkFetchPersonalModelUsage(
  appIds: string[],
  userId: string,
  tx?: DbContext
): Promise<Map<string, ModelUsage[]>> {
  const dbContext = getDbContext(tx);
  const modelUsage = await dbContext.transaction.groupBy({
    by: ['echoAppId', 'model'],
    where: {
      echoAppId: { in: appIds },
      userId: userId,
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

  const usageMap = new Map<string, ModelUsage[]>();

  // Group by appId
  for (const usage of modelUsage) {
    const appId = usage.echoAppId;
    if (!usageMap.has(appId)) {
      usageMap.set(appId, []);
    }

    usageMap.get(appId)!.push({
      model: usage.model,
      totalTokens: usage._sum.totalTokens || 0,
      totalModelCost: Number(usage._sum.cost || 0),
    });
  }

  return usageMap;
}

/**
 * Bulk fetch recent transactions for multiple apps
 */
async function bulkFetchGlobalRecentTransactions(
  appIds: string[],
  limit: number = 10,
  tx?: DbContext
) {
  const dbContext = getDbContext(tx);

  // Since Prisma doesn't support window functions directly, we'll fetch more data and limit in memory
  // This is less efficient for very large datasets but works well for reasonable app counts
  const transactions = await dbContext.transaction.findMany({
    where: {
      echoAppId: { in: appIds },
      isArchived: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    // Fetch more than needed per app, then limit in memory
    take: limit * appIds.length,
  });

  // Group by app and limit to N per app
  const transactionMap = new Map();
  const appCounts = new Map<string, number>();

  for (const transaction of transactions) {
    const appId = transaction.echoAppId;
    const currentCount = appCounts.get(appId) || 0;

    if (currentCount < limit) {
      if (!transactionMap.has(appId)) {
        transactionMap.set(appId, []);
      }
      transactionMap.get(appId).push(transaction);
      appCounts.set(appId, currentCount + 1);
    }
  }

  return transactionMap;
}

/**
 * Bulk fetch personal recent transactions for a user across multiple apps
 */
async function bulkFetchPersonalRecentTransactions(
  appIds: string[],
  userId: string,
  limit: number = 10,
  tx?: DbContext
) {
  const dbContext = getDbContext(tx);

  // Since Prisma doesn't support window functions directly, we'll fetch more data and limit in memory
  const transactions = await dbContext.transaction.findMany({
    where: {
      echoAppId: { in: appIds },
      userId: userId,
      isArchived: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    // Fetch more than needed per app, then limit in memory
    take: limit * appIds.length,
  });

  // Group by app and limit to N per app
  const transactionMap = new Map();
  const appCounts = new Map<string, number>();

  for (const transaction of transactions) {
    const appId = transaction.echoAppId;
    const currentCount = appCounts.get(appId) || 0;

    if (currentCount < limit) {
      if (!transactionMap.has(appId)) {
        transactionMap.set(appId, []);
      }
      transactionMap.get(appId).push(transaction);
      appCounts.set(appId, currentCount + 1);
    }
  }

  return transactionMap;
}

/**
 * Bulk fetch API keys for multiple apps
 */
async function bulkFetchGlobalApiKeys(
  appIds: string[],
  tx?: DbContext
): Promise<Map<string, CustomerApiKey[]>> {
  const dbContext = getDbContext(tx);
  const apiKeys = await dbContext.apiKey.findMany({
    where: {
      echoAppId: { in: appIds },
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      lastUsed: true,
      userId: true,
      echoAppId: true,
      isArchived: true,
      archivedAt: true,
      transactions: {
        where: {
          isArchived: false,
        },
      },
    },
  });

  const apiKeyMap = new Map<string, CustomerApiKey[]>();
  for (const apiKey of apiKeys) {
    const appId = apiKey.echoAppId;
    if (!apiKeyMap.has(appId)) {
      apiKeyMap.set(appId, []);
    }
    apiKeyMap.get(appId)!.push(apiKey as CustomerApiKey);
  }

  return apiKeyMap;
}

/**
 * Bulk fetch personal API keys for a user across multiple apps
 */
async function bulkFetchPersonalApiKeys(
  appIds: string[],
  userId: string,
  tx?: DbContext
): Promise<Map<string, CustomerApiKey[]>> {
  const dbContext = getDbContext(tx);
  const apiKeys = await dbContext.apiKey.findMany({
    where: {
      echoAppId: { in: appIds },
      userId: userId,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      lastUsed: true,
      userId: true,
      echoAppId: true,
      isArchived: true,
      archivedAt: true,
      transactions: {
        where: {
          isArchived: false,
        },
      },
    },
  });

  const apiKeyMap = new Map<string, CustomerApiKey[]>();
  for (const apiKey of apiKeys) {
    const appId = apiKey.echoAppId;
    if (!apiKeyMap.has(appId)) {
      apiKeyMap.set(appId, []);
    }
    apiKeyMap.get(appId)!.push(apiKey as CustomerApiKey);
  }

  return apiKeyMap;
}

/**
 * Bulk fetch public app information for all public apps
 * Returns only public apps that are visible to everyone
 */
export const bulkGetPublicAppInfo = async (): Promise<PublicEchoApp[]> => {
  return withTransaction(async tx => {
    const dbContext = getDbContext(tx);

    // Find all public apps
    const publicApps = await dbContext.echoApp.findMany({
      where: {
        isPublic: true,
        isArchived: false,
      },
      select: {
        id: true,
      },
    });

    const appIds = publicApps.map(app => app.id);

    if (appIds.length === 0) {
      return [];
    }

    // Fetch all data in parallel using bulk operations
    const [
      appsWithOwners,
      globalTransactionStats,
      globalModelUsage,
      revenueMap,
      activityMap,
    ] = await Promise.all([
      bulkFetchAppsWithOwners(
        appIds,
        {
          requirePublic: true,
          includeOwnerEmail: false,
        },
        tx
      ),
      bulkFetchGlobalTransactionStats(appIds, tx),
      bulkFetchGlobalModelUsage(appIds, tx),
      getTotalRevenueForApps(appIds, tx),
      getAppActivityForApps(appIds, 7, undefined, tx),
    ]);

    // Build results by joining the data
    return appsWithOwners.map(({ app, owner }) => {
      const appId = app.id;
      const transactionStats = globalTransactionStats.get(appId) || {
        count: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      };

      const globalStats: GlobalStatistics = {
        globalTotalTransactions: transactionStats.count,
        globalTotalRevenue: revenueMap.get(appId) || 0,
        globalTotalModelCost: transactionStats.cost,
        globalTotalTokens: transactionStats.totalTokens,
        globalTotalInputTokens: transactionStats.inputTokens,
        globalTotalOutputTokens: transactionStats.outputTokens,
        globalActivityData: activityMap.get(appId) || [],
        globalModelUsage: globalModelUsage.get(appId) || [],
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
  });
};

/**
 * Bulk fetch customer app information for multiple apps
 * Returns apps where the user has CUSTOMER role access
 */
export const bulkGetCustomerAppInfo = async (
  userId: string
): Promise<CustomerEchoApp[]> => {
  return withTransaction(async tx => {
    const dbContext = getDbContext(tx);

    // First, find all apps where user has customer/admin access (but not owner)
    const customerMemberships = await dbContext.appMembership.findMany({
      where: {
        userId: userId,
        role: { in: [AppRole.CUSTOMER, AppRole.ADMIN] },
        isArchived: false,
      },
      select: {
        echoAppId: true,
      },
    });

    const accessibleAppIds = customerMemberships.map(
      membership => membership.echoAppId
    );

    if (accessibleAppIds.length === 0) {
      return [];
    }

    // Fetch all data in parallel using bulk operations
    const [
      appsWithOwners,
      globalTransactionStats,
      personalTransactionStats,
      globalModelUsage,
      personalModelUsage,
      personalRecentTransactions,
      personalApiKeys,
      globalRevenue,
      personalActivity,
      globalActivity,
    ] = await Promise.all([
      bulkFetchAppsWithOwners(
        accessibleAppIds,
        {
          includeOwnerEmail: true,
          includeConfig: false,
        },
        tx
      ),
      bulkFetchGlobalTransactionStats(accessibleAppIds, tx),
      bulkFetchPersonalTransactionStats(accessibleAppIds, userId, tx),
      bulkFetchGlobalModelUsage(accessibleAppIds, tx),
      bulkFetchPersonalModelUsage(accessibleAppIds, userId, tx),
      bulkFetchPersonalRecentTransactions(accessibleAppIds, userId, 10, tx),
      bulkFetchPersonalApiKeys(accessibleAppIds, userId, tx),
      getTotalRevenueForApps(accessibleAppIds, tx),
      getAppActivityForApps(accessibleAppIds, 7, userId, tx),
      getAppActivityForApps(accessibleAppIds, 7, undefined, tx),
    ]);

    // Build results by joining the data
    return appsWithOwners.map(({ app, owner }) => {
      const appId = app.id;
      const personalStats = personalTransactionStats.get(appId) || {
        count: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      };

      const globalStatsData = globalTransactionStats.get(appId) || {
        count: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      };

      // Create customer app without restricted fields
      const { ...customerApp } = app;

      return {
        ...customerApp,
        owner,
        stats: {
          // Personal statistics
          personalTotalRevenue: globalRevenue.get(appId) || 0, // TODO: Replace with personal revenue when available
          personalTotalModelCost: personalStats.cost,
          personalTotalTokens: personalStats.totalTokens,
          personalTotalInputTokens: personalStats.inputTokens,
          personalTotalOutputTokens: personalStats.outputTokens,
          personalRecentTransactions:
            personalRecentTransactions.get(appId) || [],
          personalModelUsage: personalModelUsage.get(appId) || [],
          personalActivityData: personalActivity.get(appId) || [],
          personalApiKeys: personalApiKeys.get(appId) || [],

          // Global statistics (required by CustomerStatistics which extends GlobalStatistics)
          globalTotalTransactions: globalStatsData.count,
          globalTotalRevenue: globalRevenue.get(appId) || 0,
          globalTotalModelCost: globalStatsData.cost,
          globalTotalTokens: globalStatsData.totalTokens,
          globalTotalInputTokens: globalStatsData.inputTokens,
          globalTotalOutputTokens: globalStatsData.outputTokens,
          globalActivityData: globalActivity.get(appId) || [],
          globalModelUsage: globalModelUsage.get(appId) || [],
        },
      } as CustomerEchoApp;
    });
  });
};

/**
 * Bulk fetch owner app information for multiple apps
 * Returns apps where the user has OWNER role access
 */
export const bulkGetOwnerAppInfo = async (
  userId: string
): Promise<OwnerEchoApp[]> => {
  return withTransaction(async tx => {
    const dbContext = getDbContext(tx);

    // First, find all apps where user has owner access
    const ownerMemberships = await dbContext.appMembership.findMany({
      where: {
        userId: userId,
        role: AppRole.OWNER,
        isArchived: false,
      },
      select: {
        echoAppId: true,
      },
    });

    const ownerAppIds = ownerMemberships.map(
      membership => membership.echoAppId
    );

    if (ownerAppIds.length === 0) {
      return [];
    }

    // Fetch all data in parallel using bulk operations
    const [
      appsWithOwners,
      globalTransactionStats,
      personalTransactionStats,
      globalModelUsage,
      personalModelUsage,
      globalRecentTransactions,
      personalRecentTransactions,
      globalApiKeys,
      personalApiKeys,
      revenueMap,
      globalActivity,
      personalActivity,
    ] = await Promise.all([
      bulkFetchAppsWithOwners(
        ownerAppIds,
        {
          includeOwnerEmail: true,
          includeConfig: true,
        },
        tx
      ),
      bulkFetchGlobalTransactionStats(ownerAppIds, tx),
      bulkFetchPersonalTransactionStats(ownerAppIds, userId, tx),
      bulkFetchGlobalModelUsage(ownerAppIds, tx),
      bulkFetchPersonalModelUsage(ownerAppIds, userId, tx),
      bulkFetchGlobalRecentTransactions(ownerAppIds, 10, tx),
      bulkFetchPersonalRecentTransactions(ownerAppIds, userId, 10, tx),
      bulkFetchGlobalApiKeys(ownerAppIds, tx),
      bulkFetchPersonalApiKeys(ownerAppIds, userId, tx),
      getTotalRevenueForApps(ownerAppIds, tx),
      getAppActivityForApps(ownerAppIds, 7, undefined, tx),
      getAppActivityForApps(ownerAppIds, 7, userId, tx),
    ]);

    // Build results by joining the data
    return appsWithOwners.map(({ app, owner }) => {
      const appId = app.id;

      const globalStats = globalTransactionStats.get(appId) || {
        count: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      };

      const personalStats = personalTransactionStats.get(appId) || {
        count: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      };

      return {
        ...app,
        owner,
        stats: {
          // Personal stats (inherited from CustomerStatistics)
          personalTotalRevenue: revenueMap.get(appId) || 0, // TODO: Use personal revenue
          personalTotalModelCost: personalStats.cost,
          personalTotalTokens: personalStats.totalTokens,
          personalTotalInputTokens: personalStats.inputTokens,
          personalTotalOutputTokens: personalStats.outputTokens,
          personalRecentTransactions:
            personalRecentTransactions.get(appId) || [],
          personalModelUsage: personalModelUsage.get(appId) || [],
          personalActivityData: personalActivity.get(appId) || [],
          personalApiKeys: personalApiKeys.get(appId) || [],

          // Global stats (inherited from GlobalStatistics)
          globalTotalTransactions: globalStats.count,
          globalTotalRevenue: revenueMap.get(appId) || 0,
          globalTotalModelCost: globalStats.cost,
          globalTotalTokens: globalStats.totalTokens,
          globalTotalInputTokens: globalStats.inputTokens,
          globalTotalOutputTokens: globalStats.outputTokens,
          globalActivityData: globalActivity.get(appId) || [],
          globalModelUsage: globalModelUsage.get(appId) || [],

          // Owner-specific stats
          globalApiKeys: globalApiKeys.get(appId) || [],
          recentGlobalTransactions: globalRecentTransactions.get(appId) || [],
        },
      } as OwnerEchoApp;
    });
  });
};

/**
 * Fetch all apps a user has access to
 * Returns categorized apps: customer apps (member), owner apps, and public apps
 */
export const bulkGetAllUserAccessibleApps = async (
  userId: string
): Promise<(CustomerEchoApp | OwnerEchoApp | PublicEchoApp)[]> => {
  return withTransaction(async tx => {
    const dbContext = getDbContext(tx);

    // Get all app memberships for the user
    const userMemberships = await dbContext.appMembership.findMany({
      where: {
        userId: userId,
        isArchived: false,
      },
      select: {
        echoAppId: true,
        role: true,
      },
    });

    // Categorize app IDs by access level for filtering public apps
    const membershipAppIds = new Set(userMemberships.map(m => m.echoAppId));

    // Fetch all app data in parallel
    const [customerApps, ownerApps, publicApps] = await Promise.all([
      bulkGetCustomerAppInfo(userId),
      bulkGetOwnerAppInfo(userId),
      bulkGetPublicAppInfo(),
    ]);

    // Filter public apps to exclude those the user already has membership access to
    const filteredPublicApps = publicApps.filter(
      app => !membershipAppIds.has(app.id)
    );

    return [...customerApps, ...ownerApps, ...filteredPublicApps].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
};
