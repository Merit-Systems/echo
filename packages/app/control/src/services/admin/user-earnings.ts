import { db } from '@/lib/db';

/**
 * User Earnings Aggregation Service
 *
 * This service provides comprehensive aggregation functions for user earnings
 * across all transaction fields, organized by app.
 *
 * Key functions:
 * - getUserEarningsAggregates(userId): Get aggregates for a specific user across all their apps
 * - getAppTransactionAggregates(appId): Get aggregates for a specific app
 * - getAllUsersEarningsAggregates(): Get global aggregates across all users and apps
 * - getAppEarningsAcrossAllUsers(appId): Get app aggregates with user info
 *
 * All monetary values are returned as numbers (converted from Decimal).
 * Transaction counts and token counts are returned as numbers.
 */

// Interface for aggregated transaction data by app
interface AppTransactionAggregates {
  appId: string;
  appName: string;
  transactionCount: number;
  totalCost: number;
  appProfit: number;
  markUpProfit: number;
  referralProfit: number;
  rawTransactionCost: number;
  // Additional metadata aggregates
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalToolCost: number;
}

// Interface for user earnings summary across all apps
interface UserEarningsAggregates {
  userId: string;
  userName: string | null;
  userEmail: string;
  totalTransactions: number;
  totalCost: number;
  totalAppProfit: number;
  totalMarkUpProfit: number;
  totalReferralProfit: number;
  totalRawTransactionCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalToolCost: number;
  appBreakdowns: AppTransactionAggregates[];
}

// Interface for global aggregates across all users and apps
interface GlobalEarningsAggregates {
  totalUsers: number;
  totalApps: number;
  totalTransactions: number;
  totalCost: number;
  totalAppProfit: number;
  totalMarkUpProfit: number;
  totalReferralProfit: number;
  totalRawTransactionCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalToolCost: number;
  userBreakdowns: UserEarningsAggregates[];
}

/**
 * Get transaction aggregates for a specific user across all their owned apps
 */
export async function getUserEarningsAggregates(
  userId: string
): Promise<UserEarningsAggregates> {
  // Get user info
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  // Get all apps owned by the user
  const userApps = await db.echoApp.findMany({
    where: {
      appMemberships: {
        some: {
          userId: userId,
          role: 'owner',
        },
      },
    },
    select: { id: true, name: true },
  });

  const appBreakdowns: AppTransactionAggregates[] = [];
  let totalCost = 0;
  let totalAppProfit = 0;
  let totalMarkUpProfit = 0;
  let totalReferralProfit = 0;
  let totalRawTransactionCost = 0;
  let totalTransactions = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;
  let totalToolCost = 0;

  // Process each app
  for (const app of userApps) {
    const appAggregates = await getAppTransactionAggregates(app.id);
    appBreakdowns.push(appAggregates);

    // Sum up totals
    totalTransactions += appAggregates.transactionCount;
    totalCost += appAggregates.totalCost;
    totalAppProfit += appAggregates.appProfit;
    totalMarkUpProfit += appAggregates.markUpProfit;
    totalReferralProfit += appAggregates.referralProfit;
    totalRawTransactionCost += appAggregates.rawTransactionCost;
    totalInputTokens += appAggregates.totalInputTokens;
    totalOutputTokens += appAggregates.totalOutputTokens;
    totalTokens += appAggregates.totalTokens;
    totalToolCost += appAggregates.totalToolCost;
  }

  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    totalTransactions,
    totalCost,
    totalAppProfit,
    totalMarkUpProfit,
    totalReferralProfit,
    totalRawTransactionCost,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalToolCost,
    appBreakdowns,
  };
}

/**
 * Get transaction aggregates for a specific app
 */
export async function getAppTransactionAggregates(
  appId: string
): Promise<AppTransactionAggregates> {
  // Get app info
  const app = await db.echoApp.findUnique({
    where: { id: appId },
    select: { id: true, name: true },
  });

  if (!app) {
    throw new Error(`App with id ${appId} not found`);
  }

  // Use raw SQL for efficient aggregation with JOIN to transaction_metadata
  const [result] = await db.$queryRaw<
    Array<{
      transactionCount: bigint;
      totalCost: string;
      appProfit: string;
      markUpProfit: string;
      referralProfit: string;
      rawTransactionCost: string;
      totalInputTokens: bigint | null;
      totalOutputTokens: bigint | null;
      totalTokens: bigint | null;
      totalToolCost: string;
    }>
  >`
    SELECT 
      COUNT(t.id)::bigint as "transactionCount",
      COALESCE(SUM(t."totalCost"), 0)::text as "totalCost",
      COALESCE(SUM(t."appProfit"), 0)::text as "appProfit",
      COALESCE(SUM(t."markUpProfit"), 0)::text as "markUpProfit",
      COALESCE(SUM(t."referralProfit"), 0)::text as "referralProfit",
      COALESCE(SUM(t."rawTransactionCost"), 0)::text as "rawTransactionCost",
      COALESCE(SUM(tm."inputTokens"), 0)::bigint as "totalInputTokens",
      COALESCE(SUM(tm."outputTokens"), 0)::bigint as "totalOutputTokens",
      COALESCE(SUM(tm."totalTokens"), 0)::bigint as "totalTokens",
      COALESCE(SUM(tm."toolCost"), 0)::text as "totalToolCost"
    FROM transactions t
    LEFT JOIN transaction_metadata tm ON t."transactionMetadataId" = tm.id AND tm."isArchived" = false
    WHERE t."echoAppId" = ${appId}::uuid
      AND t."isArchived" = false
  `;

  return {
    appId: app.id,
    appName: app.name,
    transactionCount: Number(result.transactionCount),
    totalCost: Number(result.totalCost),
    appProfit: Number(result.appProfit),
    markUpProfit: Number(result.markUpProfit),
    referralProfit: Number(result.referralProfit),
    rawTransactionCost: Number(result.rawTransactionCost),
    totalInputTokens: Number(result.totalInputTokens || 0),
    totalOutputTokens: Number(result.totalOutputTokens || 0),
    totalTokens: Number(result.totalTokens || 0),
    totalToolCost: Number(result.totalToolCost),
  };
}

/**
 * Get transaction aggregates for all users across all apps
 */
export async function getAllUsersEarningsAggregates(): Promise<GlobalEarningsAggregates> {
  // Get all users who own at least one app
  const usersWithApps = await db.user.findMany({
    where: {
      appMemberships: {
        some: {
          role: 'owner',
        },
      },
    },
    select: { id: true, name: true, email: true },
  });

  return await processUsersEarningsAggregates(usersWithApps);
}

/**
 * Get paginated transaction aggregates for all users across all apps
 */
export async function getAllUsersEarningsAggregatesPaginated(
  page: number = 0,
  pageSize: number = 10
): Promise<
  GlobalEarningsAggregates & {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      hasMore: boolean;
    };
  }
> {
  // Get total count of users who own at least one app
  const totalUsers = await db.user.count({
    where: {
      appMemberships: {
        some: {
          role: 'owner',
        },
      },
    },
  });

  // Get paginated users who own at least one app
  const usersWithApps = await db.user.findMany({
    where: {
      appMemberships: {
        some: {
          role: 'owner',
        },
      },
    },
    select: { id: true, name: true, email: true },
    skip: page * pageSize,
    take: pageSize,
  });

  const aggregates = await processUsersEarningsAggregates(usersWithApps);

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
 * Helper function to process users earnings aggregates
 */
async function processUsersEarningsAggregates(
  users: { id: string; name: string | null; email: string }[]
): Promise<GlobalEarningsAggregates> {
  const userBreakdowns: UserEarningsAggregates[] = [];
  const totalUsers = users.length;
  let totalApps = 0;
  let totalTransactions = 0;
  let totalCost = 0;
  let totalAppProfit = 0;
  let totalMarkUpProfit = 0;
  let totalReferralProfit = 0;
  let totalRawTransactionCost = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;
  let totalToolCost = 0;

  // Process each user
  for (const user of users) {
    const userAggregates = await getUserEarningsAggregates(user.id);
    userBreakdowns.push(userAggregates);

    // Sum up global totals
    totalApps += userAggregates.appBreakdowns.length;
    totalTransactions += userAggregates.totalTransactions;
    totalCost += userAggregates.totalCost;
    totalAppProfit += userAggregates.totalAppProfit;
    totalMarkUpProfit += userAggregates.totalMarkUpProfit;
    totalReferralProfit += userAggregates.totalReferralProfit;
    totalRawTransactionCost += userAggregates.totalRawTransactionCost;
    totalInputTokens += userAggregates.totalInputTokens;
    totalOutputTokens += userAggregates.totalOutputTokens;
    totalTokens += userAggregates.totalTokens;
    totalToolCost += userAggregates.totalToolCost;
  }

  return {
    totalUsers,
    totalApps,
    totalTransactions,
    totalCost,
    totalAppProfit,
    totalMarkUpProfit,
    totalReferralProfit,
    totalRawTransactionCost,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalToolCost,
    userBreakdowns,
  };
}

/**
 * Get earnings aggregates for a specific app across all users
 */
export async function getAppEarningsAcrossAllUsers(appId: string): Promise<{
  appAggregates: AppTransactionAggregates;
  userCount: number;
  ownerInfo: {
    userId: string;
    userName: string | null;
    userEmail: string;
  } | null;
}> {
  // Get app aggregates
  const appAggregates = await getAppTransactionAggregates(appId);

  // Get app owner info
  const appOwner = await db.appMembership.findFirst({
    where: {
      echoAppId: appId,
      role: 'owner',
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

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

  return {
    appAggregates,
    userCount,
    ownerInfo: appOwner
      ? {
          userId: appOwner.user.id,
          userName: appOwner.user.name,
          userEmail: appOwner.user.email,
        }
      : null,
  };
}
