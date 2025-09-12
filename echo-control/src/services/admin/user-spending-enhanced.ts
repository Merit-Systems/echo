import { db } from '@/lib/db';
import type { Prisma, Transaction } from '@prisma/client';
import { getUserSpendingAggregates } from './user-spending';

export interface UserSpendingEnhanced {
  userId: string;
  userName: string | null;
  userEmail: string;
  totalSpent: number;
  currentBalance: number;
  freeTierPoolUsage: number;
  personalBalanceUsage: number;
  totalStripePayments: number;
  totalTransactions: number;
  totalApps: number;
  appBreakdowns: AppSpendingBreakdown[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSpendingBreakdown {
  appId: string;
  appName: string;
  totalSpent: number;
  freeTierUsage: number;
  personalBalanceUsage: number;
  transactionCount: number;
  totalTokens: number;
}

export interface UserSpendingEnhancedPaginated {
  users: UserSpendingEnhanced[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  globalTotals: {
    totalUsers: number;
    totalApps: number;
    totalSpent: number;
    totalCurrentBalance: number;
    totalFreeTierUsage: number;
    totalPersonalBalanceUsage: number;
    totalStripePayments: number;
    totalTransactions: number;
  };
}

export async function getUsersSpendingEnhancedPaginated(
  page: number = 0,
  pageSize: number = 25,
  searchTerm?: string,
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
): Promise<UserSpendingEnhancedPaginated> {
  // Build where clause for search
  const searchWhere = searchTerm ? {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' as const } },
      { email: { contains: searchTerm, mode: 'insensitive' as const } },
      { id: { contains: searchTerm } }
    ]
  } : {};

  // Count total users who have made transactions
  const totalUsers = await db.user.count({
    where: {
      ...searchWhere,
      transactions: {
        some: {
          isArchived: false,
        },
      },
    },
  });

  // Build order by clause
  const orderBy: Prisma.UserOrderByWithRelationInput = {};
  if (sortField && sortDirection) {
    switch (sortField) {
      case 'userName':
        orderBy.name = sortDirection;
        break;
      case 'userEmail':
        orderBy.email = sortDirection;
        break;
      case 'totalSpent':
        orderBy.totalSpent = sortDirection;
        break;
      case 'currentBalance':
        orderBy.totalPaid = sortDirection; // Rough approximation
        break;
      case 'createdAt':
        orderBy.createdAt = sortDirection;
        break;
      case 'updatedAt':
        orderBy.updatedAt = sortDirection;
        break;
      default:
        orderBy.totalSpent = 'desc';
    }
  } else {
    orderBy.totalSpent = 'desc';
  }

  // Get paginated users who have transactions
  const users = await db.user.findMany({
    where: {
      ...searchWhere,
      transactions: {
        some: {
          isArchived: false,
        },
      },
    },
    include: {
      transactions: {
        where: { isArchived: false },
        include: {
          echoApp: true,
          spendPool: true,
        },
      },
      payments: {
        where: { 
          source: 'stripe',
          isArchived: false,
        },
      },
    },
    orderBy,
    skip: page * pageSize,
    take: pageSize,
  });

  // Build the response data
  const userResults: UserSpendingEnhanced[] = [];
  let globalTotalSpent = 0;
  let globalTotalCurrentBalance = 0;
  let globalTotalFreeTierUsage = 0;
  let globalTotalPersonalBalanceUsage = 0;
  let globalTotalStripePayments = 0;
  let globalTotalTransactions = 0;
  let globalTotalApps = 0;

  for (const user of users) {
    // Get user spending aggregates
    const userSpending = await getUserSpendingAggregates(user.id);

    // Calculate free tier vs personal balance usage
    let freeTierPoolUsage = 0;
    let personalBalanceUsage = 0;
    
    for (const transaction of user.transactions) {
      const cost = Number(transaction.totalCost);
      if (transaction.spendPool) {
        freeTierPoolUsage += cost;
      } else {
        personalBalanceUsage += cost;
      }
    }

    // Calculate total stripe payments
    const totalStripePayments = user.payments
      .filter(payment => payment.source === 'stripe')
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    // Calculate current balance
    const totalPaid = Number(user.totalPaid);
    const totalSpent = Number(user.totalSpent);
    const currentBalance = totalPaid - totalSpent;

    // Group transactions by app
    const appTransactions = user.transactions.reduce((acc, transaction) => {
      const appId = transaction.echoAppId;
      if (!acc[appId]) {
        acc[appId] = {
          appId,
          appName: transaction.echoApp.name,
          transactions: [],
        };
      }
      acc[appId].transactions.push(transaction);
      return acc;
    }, {} as Record<string, { appId: string; appName: string; transactions: Transaction[] }>);

    // Build app breakdowns
    const appBreakdowns: AppSpendingBreakdown[] = Object.values(appTransactions).map(app => {
      const appTransactions = app.transactions;
      const totalSpent = appTransactions.reduce((sum, t) => sum + Number(t.totalCost), 0);
      const freeTierUsage = appTransactions
        .filter(t => t.spendPool)
        .reduce((sum, t) => sum + Number(t.totalCost), 0);
      const personalBalanceUsage = appTransactions
        .filter(t => !t.spendPool)
        .reduce((sum, t) => sum + Number(t.totalCost), 0);
      
      const totalTokens = appTransactions.reduce((sum, t) => {
        return sum + (t.transactionMetadata?.totalTokens || 0);
      }, 0);

      return {
        appId: app.appId,
        appName: app.appName,
        totalSpent,
        freeTierUsage,
        personalBalanceUsage,
        transactionCount: appTransactions.length,
        totalTokens,
      };
    });

    const userResult: UserSpendingEnhanced = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      totalSpent: userSpending.totalSpent,
      currentBalance,
      freeTierPoolUsage,
      personalBalanceUsage,
      totalStripePayments,
      totalTransactions: user.transactions.length,
      totalApps: appBreakdowns.length,
      appBreakdowns,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    userResults.push(userResult);

    // Add to global totals
    globalTotalSpent += userSpending.totalSpent;
    globalTotalCurrentBalance += currentBalance;
    globalTotalFreeTierUsage += freeTierPoolUsage;
    globalTotalPersonalBalanceUsage += personalBalanceUsage;
    globalTotalStripePayments += totalStripePayments;
    globalTotalTransactions += user.transactions.length;
    globalTotalApps += appBreakdowns.length;
  }

  // Sort results if needed (for numeric fields that require post-processing)
  if (sortField && sortDirection && ['totalSpent', 'currentBalance', 'freeTierPoolUsage', 'personalBalanceUsage', 'totalStripePayments', 'totalTransactions', 'totalApps'].includes(sortField)) {
    userResults.sort((a, b) => {
      const aValue = (a as UserSpendingEnhanced)[sortField as keyof UserSpendingEnhanced];
      const bValue = (b as UserSpendingEnhanced)[sortField as keyof UserSpendingEnhanced];
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  return {
    users: userResults,
    pagination: {
      page,
      pageSize,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      hasMore: (page + 1) * pageSize < totalUsers,
    },
    globalTotals: {
      totalUsers: users.length,
      totalApps: globalTotalApps,
      totalSpent: globalTotalSpent,
      totalCurrentBalance: globalTotalCurrentBalance,
      totalFreeTierUsage: globalTotalFreeTierUsage,
      totalPersonalBalanceUsage: globalTotalPersonalBalanceUsage,
      totalStripePayments: globalTotalStripePayments,
      totalTransactions: globalTotalTransactions,
    },
  };
}

export async function getUserSpendingEnhanced(userId: string): Promise<UserSpendingEnhanced> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      transactions: {
        where: { isArchived: false },
        include: {
          echoApp: true,
          spendPool: true,
          transactionMetadata: true,
        },
      },
      payments: {
        where: { 
          source: 'stripe',
          isArchived: false,
        },
      },
    },
  });

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  // Get user spending aggregates
  const userSpending = await getUserSpendingAggregates(userId);

  // Calculate free tier vs personal balance usage
  let freeTierPoolUsage = 0;
  let personalBalanceUsage = 0;
  
  for (const transaction of user.transactions) {
    const cost = Number(transaction.totalCost);
    if (transaction.spendPool) {
      freeTierPoolUsage += cost;
    } else {
      personalBalanceUsage += cost;
    }
  }

  // Calculate total stripe payments
  const totalStripePayments = user.payments
    .filter(payment => payment.source === 'stripe')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  // Calculate current balance
  const totalPaid = Number(user.totalPaid);
  const totalSpent = Number(user.totalSpent);
  const currentBalance = totalPaid - totalSpent;

  // Group transactions by app
  const appTransactions = user.transactions.reduce((acc, transaction) => {
    const appId = transaction.echoAppId;
    if (!acc[appId]) {
      acc[appId] = {
        appId,
        appName: transaction.echoApp.name,
        transactions: [],
      };
    }
    acc[appId].transactions.push(transaction);
    return acc;
  }, {} as Record<string, { appId: string; appName: string; transactions: Transaction[] }>);

  // Build app breakdowns
  const appBreakdowns: AppSpendingBreakdown[] = Object.values(appTransactions).map(app => {
    const appTransactions = app.transactions;
    const totalSpent = appTransactions.reduce((sum, t) => sum + Number(t.totalCost), 0);
    const freeTierUsage = appTransactions
      .filter(t => t.spendPool)
      .reduce((sum, t) => sum + Number(t.totalCost), 0);
    const personalBalanceUsage = appTransactions
      .filter(t => !t.spendPool)
      .reduce((sum, t) => sum + Number(t.totalCost), 0);
    
    const totalTokens = appTransactions.reduce((sum, t) => {
      return sum + Number(t.transactionMetadata?.totalTokens || 0);
    }, 0);

    return {
      appId: app.appId,
      appName: app.appName,
      totalSpent,
      freeTierUsage,
      personalBalanceUsage,
      transactionCount: appTransactions.length,
      totalTokens,
    };
  });

  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    totalSpent: userSpending.totalSpent,
    currentBalance,
    freeTierPoolUsage,
    personalBalanceUsage,
    totalStripePayments,
    totalTransactions: user.transactions.length,
    totalApps: appBreakdowns.length,
    appBreakdowns,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}