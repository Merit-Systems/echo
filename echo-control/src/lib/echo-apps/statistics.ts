import { db } from '../db';
import { DbContext, getDbContext } from '../transaction-utils';
import { AppRole } from '../permissions/types';
import { getTotalRevenueForApp } from '../revenue';
import { getAppActivity } from './activity/activity';
import { ModelUsage, CustomerApiKey } from './types';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Fetch basic app information with owner details
 */
export async function fetchAppWithOwner(
  appId: string,
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
  const app = await dbContext.echoApp.findFirst({
    where: {
      id: appId,
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

  if (!app) {
    const errorMsg = requirePublic
      ? 'Echo app not found or not publicly accessible'
      : 'Echo app not found or access denied';
    throw new Error(errorMsg);
  }

  const owner = app.appMemberships[0]?.user;
  return {
    app: {
      ...app,
      githubType: app.githubType as 'user' | 'repo' | null,
    },
    owner: owner
      ? {
          id: owner.id,
          email: includeOwnerEmail ? owner.email : '',
          name: owner.name,
          profilePictureUrl: owner.profilePictureUrl,
        }
      : {
          id: '',
          email: '',
          name: null,
          profilePictureUrl: null,
        },
  };
}

/**
 * Fetch global transaction statistics for an app
 */
export async function fetchGlobalTransactionStats(
  appId: string,
  tx?: DbContext
) {
  const dbContext = getDbContext(tx);
  return dbContext.transaction.aggregate({
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
}

/**
 * Fetch personal transaction statistics for a user in an app
 */
export async function fetchPersonalTransactionStats(
  appId: string,
  userId: string,
  tx?: DbContext
) {
  const dbContext = getDbContext(tx);
  return dbContext.transaction.aggregate({
    where: {
      echoAppId: appId,
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
}

/**
 * Fetch global model usage for an app
 */
export async function fetchGlobalModelUsage(
  appId: string,
  tx?: DbContext
): Promise<ModelUsage[]> {
  const dbContext = getDbContext(tx);
  const modelUsage = await dbContext.transaction.groupBy({
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

  return modelUsage.map(usage => ({
    model: usage.model,
    totalTokens: usage._sum.totalTokens || 0,
    totalModelCost: Number(usage._sum.cost || 0),
  }));
}

/**
 * Fetch personal model usage for a user in an app
 */
export async function fetchPersonalModelUsage(
  appId: string,
  userId: string,
  tx?: DbContext
): Promise<ModelUsage[]> {
  const dbContext = getDbContext(tx);
  const modelUsage = await dbContext.transaction.groupBy({
    by: ['model'],
    where: {
      echoAppId: appId,
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

  return modelUsage.map(usage => ({
    model: usage.model,
    totalTokens: usage._sum.totalTokens || 0,
    totalModelCost: Number(usage._sum.cost || 0),
  }));
}

/**
 * Fetch global recent transactions for an app
 */
export async function fetchGlobalRecentTransactions(
  appId: string,
  limit: number = 10,
  tx?: DbContext
) {
  const dbContext = getDbContext(tx);
  return dbContext.transaction.findMany({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Fetch personal recent transactions for a user in an app
 */
export async function fetchPersonalRecentTransactions(
  appId: string,
  userId: string,
  limit: number = 10,
  tx?: DbContext
) {
  const dbContext = getDbContext(tx);
  return dbContext.transaction.findMany({
    where: {
      echoAppId: appId,
      userId: userId,
      isArchived: false,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Fetch global API keys for an app
 */
export async function fetchGlobalApiKeys(
  appId: string,
  tx?: DbContext
): Promise<CustomerApiKey[]> {
  const dbContext = getDbContext(tx);
  const apiKeys = await dbContext.apiKey.findMany({
    where: {
      echoAppId: appId,
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

  return apiKeys as CustomerApiKey[];
}

/**
 * Fetch personal API keys for a user in an app
 */
export async function fetchPersonalApiKeys(
  appId: string,
  userId: string,
  tx?: DbContext
): Promise<CustomerApiKey[]> {
  const dbContext = getDbContext(tx);
  const apiKeys = await dbContext.apiKey.findMany({
    where: {
      echoAppId: appId,
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

  return apiKeys as CustomerApiKey[];
}

/**
 * Helper to create statistics structure from aggregated data
 */
export function createStatsFromAggregate(aggregate: {
  _count: number;
  _sum: {
    totalTokens: number | null;
    inputTokens: number | null;
    outputTokens: number | null;
    cost: Decimal | null; // Prisma Decimal type - we convert to number
  };
}) {
  return {
    count: aggregate._count,
    totalTokens: aggregate._sum.totalTokens || 0,
    inputTokens: aggregate._sum.inputTokens || 0,
    outputTokens: aggregate._sum.outputTokens || 0,
    cost: Number(aggregate._sum.cost || 0),
  };
}

/**
 * Fetch comprehensive global statistics for an app in a single transaction
 */
export async function fetchGlobalAppStatistics(appId: string) {
  return db.$transaction(async tx => {
    const [
      transactionStats,
      modelUsage,
      recentTransactions,
      revenue,
      activity,
    ] = await Promise.all([
      tx.transaction.aggregate({
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
      }),
      fetchGlobalModelUsage(appId, tx),
      fetchGlobalRecentTransactions(appId, 10, tx),
      getTotalRevenueForApp(appId, tx),
      getAppActivity(appId, 7, undefined, tx),
    ]);

    const stats = createStatsFromAggregate(transactionStats);

    return {
      transactionStats: stats,
      modelUsage,
      recentTransactions,
      revenue,
      activity,
    };
  });
}

/**
 * Fetch comprehensive personal statistics for a user in an app in a single transaction
 */
export async function fetchPersonalAppStatistics(
  appId: string,
  userId: string
) {
  return db.$transaction(async tx => {
    const [
      transactionStats,
      modelUsage,
      recentTransactions,
      apiKeys,
      revenue, // Note: This should be personal revenue, but we don't have that function yet
      activity,
    ] = await Promise.all([
      tx.transaction.aggregate({
        where: {
          echoAppId: appId,
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
      }),
      fetchPersonalModelUsage(appId, userId, tx),
      fetchPersonalRecentTransactions(appId, userId, 10, tx),
      fetchPersonalApiKeys(appId, userId, tx),
      getTotalRevenueForApp(appId, tx), // TODO: Replace with personal revenue when available
      getAppActivity(appId, 7, userId, tx),
    ]);

    const stats = createStatsFromAggregate(transactionStats);

    return {
      transactionStats: stats,
      modelUsage,
      recentTransactions,
      apiKeys,
      revenue,
      activity,
    };
  });
}

/**
 * Fetch comprehensive owner statistics (both global and personal) for an app in a single transaction
 */
export async function fetchOwnerAppStatistics(appId: string, userId: string) {
  return db.$transaction(async tx => {
    const [globalStats, personalStats, globalApiKeys] = await Promise.all([
      fetchGlobalAppStatistics(appId),
      fetchPersonalAppStatistics(appId, userId),
      fetchGlobalApiKeys(appId, tx),
    ]);

    return {
      global: globalStats,
      personal: personalStats,
      globalApiKeys,
    };
  });
}
