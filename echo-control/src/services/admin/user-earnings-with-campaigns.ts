import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { getUserEarningsAggregates } from './user-earnings';
import { getSentCampaignsForApps } from './email-campaigns';

export interface UserEarningsWithCampaigns {
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
  totalApps: number;
  totalReferralCodes: number;
  totalReferrerUsers: number;
  emailCampaignsReceived: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEarningsWithCampaignsPaginated {
  users: UserEarningsWithCampaigns[];
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
  };
}

export async function getUsersEarningsWithCampaignsPaginated(
  page: number = 0,
  pageSize: number = 25,
  searchTerm?: string,
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
): Promise<UserEarningsWithCampaignsPaginated> {
  // Build where clause for search
  const searchWhere = searchTerm ? {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' as const } },
      { email: { contains: searchTerm, mode: 'insensitive' as const } },
      { id: { contains: searchTerm } }
    ]
  } : {};

  // Count total users who own apps
  const totalUsers = await db.user.count({
    where: {
      ...searchWhere,
      appMemberships: {
        some: {
          role: 'owner',
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
      case 'createdAt':
        orderBy.createdAt = sortDirection;
        break;
      case 'updatedAt':
        orderBy.updatedAt = sortDirection;
        break;
      default:
        orderBy.createdAt = 'desc';
    }
  } else {
    orderBy.createdAt = 'desc';
  }

  // Get paginated users
  const users = await db.user.findMany({
    where: {
      ...searchWhere,
      appMemberships: {
        some: {
          role: 'owner',
          isArchived: false,
        },
      },
    },
    include: {
      appMemberships: {
        where: { role: 'owner', isArchived: false },
        include: {
          echoApp: true,
        },
      },
      ReferralCode: true,
    },
    orderBy,
    skip: page * pageSize,
    take: pageSize,
  });

  // Get all app IDs to fetch email campaigns
  const allAppIds = users.flatMap(user => 
    user.appMemberships.map(membership => membership.echoApp.id)
  );
  
  const sentCampaignsByApp = await getSentCampaignsForApps(allAppIds);

  // Build the response data
  const userResults: UserEarningsWithCampaigns[] = [];
  let globalTotalTransactions = 0;
  let globalTotalCost = 0;
  let globalTotalAppProfit = 0;
  let globalTotalMarkUpProfit = 0;
  let globalTotalReferralProfit = 0;
  let globalTotalRawTransactionCost = 0;
  let globalTotalInputTokens = 0;
  let globalTotalOutputTokens = 0;
  let globalTotalTokens = 0;
  let globalTotalToolCost = 0;
  let globalTotalApps = 0;

  for (const user of users) {
    // Get user earnings
    const userEarnings = await getUserEarningsAggregates(user.id);

    // Get referral codes count
    const totalReferralCodes = user.ReferralCode.length;

    // Get referrer users count (users who used this user's referral codes)
    const referralCodeIds = user.ReferralCode.map(code => code.id);
    let totalReferrerUsers = 0;
    if (referralCodeIds.length > 0) {
      const distinctUsers = await db.appMembership.findMany({
        where: {
          referrerId: { in: referralCodeIds },
        },
        select: { userId: true },
        distinct: ['userId'],
      });
      totalReferrerUsers = distinctUsers.length;
    }

    // Get unique email campaigns received by all user's apps
    const userAppIds = user.appMemberships.map(membership => membership.echoApp.id);
    const allCampaignsReceived = new Set<string>();
    
    for (const appId of userAppIds) {
      const campaigns = sentCampaignsByApp[appId] || [];
      campaigns.forEach(campaign => allCampaignsReceived.add(campaign));
    }

    // Also get campaigns sent directly to the user
    const userCampaigns = await db.outboundEmailSent.findMany({
      where: { userId: user.id },
      select: { emailCampaignId: true },
    });
    
    userCampaigns.forEach(campaign => 
      allCampaignsReceived.add(campaign.emailCampaignId)
    );

    const userResult: UserEarningsWithCampaigns = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      totalTransactions: userEarnings.totalTransactions,
      totalCost: userEarnings.totalCost,
      totalAppProfit: userEarnings.totalAppProfit,
      totalMarkUpProfit: userEarnings.totalMarkUpProfit,
      totalReferralProfit: userEarnings.totalReferralProfit,
      totalRawTransactionCost: userEarnings.totalRawTransactionCost,
      totalInputTokens: userEarnings.totalInputTokens,
      totalOutputTokens: userEarnings.totalOutputTokens,
      totalTokens: userEarnings.totalTokens,
      totalToolCost: userEarnings.totalToolCost,
      totalApps: userEarnings.appBreakdowns.length,
      totalReferralCodes,
      totalReferrerUsers,
      emailCampaignsReceived: Array.from(allCampaignsReceived),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    userResults.push(userResult);

    // Add to global totals
    globalTotalTransactions += userEarnings.totalTransactions;
    globalTotalCost += userEarnings.totalCost;
    globalTotalAppProfit += userEarnings.totalAppProfit;
    globalTotalMarkUpProfit += userEarnings.totalMarkUpProfit;
    globalTotalReferralProfit += userEarnings.totalReferralProfit;
    globalTotalRawTransactionCost += userEarnings.totalRawTransactionCost;
    globalTotalInputTokens += userEarnings.totalInputTokens;
    globalTotalOutputTokens += userEarnings.totalOutputTokens;
    globalTotalTokens += userEarnings.totalTokens;
    globalTotalToolCost += userEarnings.totalToolCost;
    globalTotalApps += userEarnings.appBreakdowns.length;
  }

  // Sort results if needed (for numeric fields that require post-processing)
  if (sortField && sortDirection && ['totalTransactions', 'totalCost', 'totalAppProfit', 'totalMarkUpProfit', 'totalReferralProfit', 'totalApps', 'totalReferralCodes', 'totalReferrerUsers'].includes(sortField)) {
    userResults.sort((a, b) => {
      const aValue = (a as UserEarningsWithCampaigns)[sortField as keyof UserEarningsWithCampaigns];
      const bValue = (b as UserEarningsWithCampaigns)[sortField as keyof UserEarningsWithCampaigns];
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
      totalTransactions: globalTotalTransactions,
      totalCost: globalTotalCost,
      totalAppProfit: globalTotalAppProfit,
      totalMarkUpProfit: globalTotalMarkUpProfit,
      totalReferralProfit: globalTotalReferralProfit,
      totalRawTransactionCost: globalTotalRawTransactionCost,
      totalInputTokens: globalTotalInputTokens,
      totalOutputTokens: globalTotalOutputTokens,
      totalTokens: globalTotalTokens,
      totalToolCost: globalTotalToolCost,
    },
  };
}

export async function getUserEarningsWithCampaigns(userId: string): Promise<UserEarningsWithCampaigns> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      appMemberships: {
        where: { role: 'owner', isArchived: false },
        include: {
          echoApp: true,
        },
      },
      ReferralCode: true,
    },
  });

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  // Get user earnings
  const userEarnings = await getUserEarningsAggregates(userId);

  // Get referral codes count
  const totalReferralCodes = user.ReferralCode.length;

  // Get referrer users count
  const singleReferralCodeIds = user.ReferralCode.map(code => code.id);
  let totalReferrerUsers = 0;
  if (singleReferralCodeIds.length > 0) {
    const distinctUsers = await db.appMembership.findMany({
      where: {
        referrerId: { in: singleReferralCodeIds },
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    totalReferrerUsers = distinctUsers.length;
  }

  // Get unique email campaigns received
  const userAppIds = user.appMemberships.map(membership => membership.echoApp.id);
  const sentCampaignsByApp = await getSentCampaignsForApps(userAppIds);
  const allCampaignsReceived = new Set<string>();
  
  for (const appId of userAppIds) {
    const campaigns = sentCampaignsByApp[appId] || [];
    campaigns.forEach(campaign => allCampaignsReceived.add(campaign));
  }

  // Also get campaigns sent directly to the user
  const userCampaigns = await db.outboundEmailSent.findMany({
    where: { userId: userId },
    select: { emailCampaignId: true },
  });
  
  userCampaigns.forEach(campaign => 
    allCampaignsReceived.add(campaign.emailCampaignId)
  );

  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    totalTransactions: userEarnings.totalTransactions,
    totalCost: userEarnings.totalCost,
    totalAppProfit: userEarnings.totalAppProfit,
    totalMarkUpProfit: userEarnings.totalMarkUpProfit,
    totalReferralProfit: userEarnings.totalReferralProfit,
    totalRawTransactionCost: userEarnings.totalRawTransactionCost,
    totalInputTokens: userEarnings.totalInputTokens,
    totalOutputTokens: userEarnings.totalOutputTokens,
    totalTokens: userEarnings.totalTokens,
    totalToolCost: userEarnings.totalToolCost,
    totalApps: userEarnings.appBreakdowns.length,
    totalReferralCodes,
    totalReferrerUsers,
    emailCampaignsReceived: Array.from(allCampaignsReceived),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}