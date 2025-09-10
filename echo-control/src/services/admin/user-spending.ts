import { db } from '@/lib/db';
/**
 * User Spending Aggregation Service
 *
 * This service provides comprehensive aggregation functions for user spending
 * across all transaction fields, organized by app and spend pools.
 *
 * Key functions:
 * - getUserSpendingAggregates(userId): Get spending aggregates for a specific user across all apps they use
 * - getAppSpendingAggregates(appId): Get spending aggregates for a specific app across all users
 * - getAllUsersSpendingAggregates(): Get global spending aggregates across all users and apps
 * - getAppSpendingAcrossAllUsers(appId): Get app spending aggregates with detailed user info
 *
 * All monetary values are returned as numbers (converted from Decimal).
 * Transaction counts and token counts are returned as numbers.
 *
 * Note: This tracks USER SPENDING (what users pay), not app earnings.
 * The primary spending source is the totalCost field from transactions.
 */

// Interface for aggregated spending data by app from user perspective
interface AppSpendingAggregates {
  appId: string;
  appName: string;
  transactionCount: number;
  totalSpent: number; // What the user spent (totalCost from transactions)
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalToolCost: number;
  // Spend pool information
  spendPoolUsage: number; // Amount spent through spend pools
  directSpending: number; // Amount spent directly (not through spend pools)
}

// Interface for user spending summary across all apps they use
interface UserSpendingAggregates {
  userId: string;
  userName: string | null;
  userEmail: string;
  totalTransactions: number;
  totalSpent: number; // Total amount spent across all apps
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalToolCost: number;
  totalSpendPoolUsage: number; // Total spent through spend pools
  totalDirectSpending: number; // Total spent directly
  // User's global balance info
  userTotalPaid: number; // From User.totalPaid
  userGlobalSpent: number; // From User.totalSpent
  userBalance: number; // totalPaid - totalSpent
  appBreakdowns: AppSpendingAggregates[];
}

// Interface for global spending aggregates across all users and apps
interface GlobalSpendingAggregates {
  totalUsers: number;
  totalApps: number;
  totalTransactions: number;
  totalSpent: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalToolCost: number;
  totalSpendPoolUsage: number;
  totalDirectSpending: number;
  userBreakdowns: UserSpendingAggregates[];
}

/**
 * Get spending aggregates for a specific user across all apps they have transactions with
 */
export async function getUserSpendingAggregates(
  userId: string
): Promise<UserSpendingAggregates> {
  // Get user info
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      totalPaid: true,
      totalSpent: true,
    },
  });

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  // Get all apps this user has transactions with
  const userTransactionApps = await db.transaction.findMany({
    where: {
      userId: userId,
      isArchived: false,
    },
    select: {
      echoApp: {
        select: { id: true, name: true },
      },
    },
    distinct: ['echoAppId'],
  });

  const uniqueApps = userTransactionApps.map(t => t.echoApp);

  const appBreakdowns: AppSpendingAggregates[] = [];
  let totalSpent = 0;
  let totalTransactions = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;
  let totalToolCost = 0;
  let totalSpendPoolUsage = 0;
  let totalDirectSpending = 0;

  // Process each app
  for (const app of uniqueApps) {
    const appSpending = await getAppSpendingForUser(app.id, userId);
    appBreakdowns.push(appSpending);

    // Sum up totals
    totalTransactions += appSpending.transactionCount;
    totalSpent += appSpending.totalSpent;
    totalInputTokens += appSpending.totalInputTokens;
    totalOutputTokens += appSpending.totalOutputTokens;
    totalTokens += appSpending.totalTokens;
    totalToolCost += appSpending.totalToolCost;
    totalSpendPoolUsage += appSpending.spendPoolUsage;
    totalDirectSpending += appSpending.directSpending;
  }

  const userTotalPaid = Number(user.totalPaid);
  const userGlobalSpent = Number(user.totalSpent);

  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    totalTransactions,
    totalSpent,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalToolCost,
    totalSpendPoolUsage,
    totalDirectSpending,
    userTotalPaid,
    userGlobalSpent,
    userBalance: userTotalPaid - userGlobalSpent,
    appBreakdowns,
  };
}

/**
 * Get spending aggregates for a specific app across all users
 */
export async function getAppSpendingAggregates(appId: string): Promise<{
  appAggregates: AppSpendingAggregates;
  userCount: number;
  totalUsers: number;
}> {
  // Get app info
  const app = await db.echoApp.findUnique({
    where: { id: appId },
    select: { id: true, name: true },
  });

  if (!app) {
    throw new Error(`App with id ${appId} not found`);
  }

  // Use raw SQL for efficient aggregation across all users for this app
  const [result] = await db.$queryRaw<
    Array<{
      transactionCount: bigint;
      totalSpent: string;
      totalInputTokens: bigint | null;
      totalOutputTokens: bigint | null;
      totalTokens: bigint | null;
      totalToolCost: string;
      spendPoolUsage: string;
    }>
  >`
    SELECT 
      COUNT(t.id)::bigint as "transactionCount",
      COALESCE(SUM(t."totalCost"), 0)::text as "totalSpent",
      COALESCE(SUM(tm."inputTokens"), 0)::bigint as "totalInputTokens",
      COALESCE(SUM(tm."outputTokens"), 0)::bigint as "totalOutputTokens",
      COALESCE(SUM(tm."totalTokens"), 0)::bigint as "totalTokens",
      COALESCE(SUM(tm."toolCost"), 0)::text as "totalToolCost",
      COALESCE(SUM(CASE WHEN t."spendPoolId" IS NOT NULL THEN t."totalCost" ELSE 0 END), 0)::text as "spendPoolUsage"
    FROM transactions t
    LEFT JOIN transaction_metadata tm ON t."transactionMetadataId" = tm.id AND tm."isArchived" = false
    WHERE t."echoAppId" = ${appId}::uuid
      AND t."isArchived" = false
  `;

  const totalSpent = Number(result.totalSpent);
  const spendPoolUsage = Number(result.spendPoolUsage);
  const directSpending = totalSpent - spendPoolUsage;

  // Count unique users who have made transactions for this app
  const uniqueUsers = await db.transaction.findMany({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    select: {
      userId: true,
    },
    distinct: ['userId'],
  });

  const userCount = uniqueUsers.length;

  // Get total registered users for context
  const totalUsers = await db.user.count({
    where: {
      isArchived: false,
    },
  });

  const appAggregates: AppSpendingAggregates = {
    appId: app.id,
    appName: app.name,
    transactionCount: Number(result.transactionCount),
    totalSpent,
    totalInputTokens: Number(result.totalInputTokens ?? 0),
    totalOutputTokens: Number(result.totalOutputTokens ?? 0),
    totalTokens: Number(result.totalTokens ?? 0),
    totalToolCost: Number(result.totalToolCost),
    spendPoolUsage,
    directSpending,
  };

  return {
    appAggregates,
    userCount,
    totalUsers,
  };
}

/**
 * Get spending aggregates for all users across all apps
 */
export async function getAllUsersSpendingAggregates(): Promise<GlobalSpendingAggregates> {
  // Get all users who have made transactions
  const usersWithTransactions = await db.user.findMany({
    where: {
      transactions: {
        some: {
          isArchived: false,
        },
      },
      isArchived: false,
    },
    select: { id: true, name: true, email: true },
  });

  return await processUsersSpendingAggregates(usersWithTransactions);
}

/**
 * Get paginated spending aggregates for all users across all apps
 */
export async function getAllUsersSpendingAggregatesPaginated(
  page = 0,
  pageSize = 10
): Promise<
  GlobalSpendingAggregates & {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      hasMore: boolean;
    };
  }
> {
  // Get total count of users who have made transactions
  const totalUsers = await db.user.count({
    where: {
      transactions: {
        some: {
          isArchived: false,
        },
      },
      isArchived: false,
    },
  });

  // Get paginated users who have made transactions
  const usersWithTransactions = await db.user.findMany({
    where: {
      transactions: {
        some: {
          isArchived: false,
        },
      },
      isArchived: false,
    },
    select: { id: true, name: true, email: true },
    skip: page * pageSize,
    take: pageSize,
  });

  const aggregates = await processUsersSpendingAggregates(
    usersWithTransactions
  );

  return {
    ...aggregates,
    pagination: {
      page,
      pageSize,
      total: totalUsers,
      hasMore: (page + 1) * pageSize < totalUsers,
    },
  };
}

/**
 * Helper function to process users spending aggregates
 */
async function processUsersSpendingAggregates(
  users: { id: string; name: string | null; email: string }[]
): Promise<GlobalSpendingAggregates> {
  const userBreakdowns: UserSpendingAggregates[] = [];
  const totalUsers = users.length;
  let totalApps = 0;
  let totalTransactions = 0;
  let totalSpent = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;
  let totalToolCost = 0;
  let totalSpendPoolUsage = 0;
  let totalDirectSpending = 0;

  // Process each user
  for (const user of users) {
    const userSpending = await getUserSpendingAggregates(user.id);
    userBreakdowns.push(userSpending);

    // Sum up global totals
    totalTransactions += userSpending.totalTransactions;
    totalSpent += userSpending.totalSpent;
    totalInputTokens += userSpending.totalInputTokens;
    totalOutputTokens += userSpending.totalOutputTokens;
    totalTokens += userSpending.totalTokens;
    totalToolCost += userSpending.totalToolCost;
    totalSpendPoolUsage += userSpending.totalSpendPoolUsage;
    totalDirectSpending += userSpending.totalDirectSpending;
  }

  // Get unique app count across all users
  const uniqueApps = await db.transaction.findMany({
    where: {
      isArchived: false,
    },
    select: {
      echoAppId: true,
    },
    distinct: ['echoAppId'],
  });

  totalApps = uniqueApps.length;

  return {
    totalUsers,
    totalApps,
    totalTransactions,
    totalSpent,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalToolCost,
    totalSpendPoolUsage,
    totalDirectSpending,
    userBreakdowns,
  };
}

/**
 * Get spending aggregates for a specific app with detailed user information
 */
export async function getAppSpendingAcrossAllUsers(appId: string): Promise<{
  appAggregates: AppSpendingAggregates;
  userCount: number;
  totalUsers: number;
  userBreakdowns: Array<{
    userId: string;
    userName: string | null;
    userEmail: string;
    userSpending: AppSpendingAggregates;
  }>;
}> {
  // Get basic app aggregates
  const { appAggregates, userCount, totalUsers } =
    await getAppSpendingAggregates(appId);

  // Get detailed user breakdowns
  const usersWithTransactions = await db.transaction.findMany({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    select: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    distinct: ['userId'],
  });

  const userBreakdowns = [];
  for (const { user } of usersWithTransactions) {
    const userSpending = await getAppSpendingForUser(appId, user.id);
    userBreakdowns.push({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userSpending,
    });
  }

  return {
    appAggregates,
    userCount,
    totalUsers,
    userBreakdowns,
  };
}

/**
 * Helper function to get app spending for a specific user
 */
async function getAppSpendingForUser(
  appId: string,
  userId: string
): Promise<AppSpendingAggregates> {
  // Get app info
  const app = await db.echoApp.findUnique({
    where: { id: appId },
    select: { id: true, name: true },
  });

  if (!app) {
    throw new Error(`App with id ${appId} not found`);
  }

  // Use raw SQL for efficient aggregation
  const [result] = await db.$queryRaw<
    Array<{
      transactionCount: bigint;
      totalSpent: string;
      totalInputTokens: bigint | null;
      totalOutputTokens: bigint | null;
      totalTokens: bigint | null;
      totalToolCost: string;
      spendPoolUsage: string;
    }>
  >`
    SELECT 
      COUNT(t.id)::bigint as "transactionCount",
      COALESCE(SUM(t."totalCost"), 0)::text as "totalSpent",
      COALESCE(SUM(tm."inputTokens"), 0)::bigint as "totalInputTokens",
      COALESCE(SUM(tm."outputTokens"), 0)::bigint as "totalOutputTokens",
      COALESCE(SUM(tm."totalTokens"), 0)::bigint as "totalTokens",
      COALESCE(SUM(tm."toolCost"), 0)::text as "totalToolCost",
      COALESCE(SUM(CASE WHEN t."spendPoolId" IS NOT NULL THEN t."totalCost" ELSE 0 END), 0)::text as "spendPoolUsage"
    FROM transactions t
    LEFT JOIN transaction_metadata tm ON t."transactionMetadataId" = tm.id AND tm."isArchived" = false
    WHERE t."echoAppId" = ${appId}::uuid
      AND t."userId" = ${userId}::uuid
      AND t."isArchived" = false
  `;

  const totalSpent = Number(result.totalSpent);
  const spendPoolUsage = Number(result.spendPoolUsage);
  const directSpending = totalSpent - spendPoolUsage;

  return {
    appId: app.id,
    appName: app.name,
    transactionCount: Number(result.transactionCount),
    totalSpent,
    totalInputTokens: Number(result.totalInputTokens ?? 0),
    totalOutputTokens: Number(result.totalOutputTokens ?? 0),
    totalTokens: Number(result.totalTokens ?? 0),
    totalToolCost: Number(result.totalToolCost),
    spendPoolUsage,
    directSpending,
  };
}
