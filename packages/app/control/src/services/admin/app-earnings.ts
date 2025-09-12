import { db } from '@/lib/db';
import { getAppTransactionAggregates } from './user-earnings';

export type AppEarningsRow = {
  appId: string;
  appName: string;
  transactionCount: number;
  totalCost: number;
  appProfit: number;
  markUpProfit: number;
  referralProfit: number;
  totalTokens: number;
  apiKeyCount: number;
  refreshTokenCount: number;
  sentCampaigns: string[];
};

export async function getAppsEarningsPaginatedWithCampaigns(
  page: number,
  pageSize: number,
  filterCampaignKey?: string,
  onlyNotReceived?: boolean
): Promise<{
  apps: AppEarningsRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}> {
  const where: {
    isArchived: boolean;
    NOT?: { OutboundEmailSent: { some: { emailCampaignId: string } } };
  } = { isArchived: false };
  if (filterCampaignKey && onlyNotReceived) {
    where.NOT = {
      OutboundEmailSent: {
        some: { emailCampaignId: filterCampaignKey },
      },
    };
  }

  const total = await db.echoApp.count({ where });

  const apps = await db.echoApp.findMany({
    where,
    select: { id: true, name: true },
    skip: page * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });

  if (apps.length === 0) {
    return {
      apps: [],
      pagination: { page, pageSize, total, hasMore: false },
    };
  }

  // Fetch sent campaigns for these apps
  const sent = await db.outboundEmailSent.findMany({
    where: { echoAppId: { in: apps.map(a => a.id) } },
    select: { echoAppId: true, emailCampaignId: true },
  });
  const sentMap = new Map<string, Set<string>>();
  for (const s of sent) {
    if (!s.echoAppId) continue;
    const set = sentMap.get(s.echoAppId) ?? new Set<string>();
    set.add(s.emailCampaignId);
    sentMap.set(s.echoAppId, set);
  }

  // Pre-compute counts for API Keys and Refresh Tokens for these apps
  const appIds = apps.map(a => a.id);

  const apiKeyCountsRaw = await db.apiKey.groupBy({
    by: ['echoAppId'],
    where: { echoAppId: { in: appIds }, isArchived: false },
    _count: { _all: true },
  });
  const apiKeyCountMap = new Map<string, number>();
  for (const row of apiKeyCountsRaw) {
    apiKeyCountMap.set(row.echoAppId as string, row._count._all);
  }

  const refreshTokenCountsRaw = await db.refreshToken.groupBy({
    by: ['echoAppId'],
    where: { echoAppId: { in: appIds }, isArchived: false },
    _count: { _all: true },
  });
  const refreshTokenCountMap = new Map<string, number>();
  for (const row of refreshTokenCountsRaw) {
    refreshTokenCountMap.set(row.echoAppId as string, row._count._all);
  }

  // Aggregate earnings for each app
  const rows: AppEarningsRow[] = [];
  for (const app of apps) {
    const agg = await getAppTransactionAggregates(app.id);
    rows.push({
      appId: app.id,
      appName: app.name,
      transactionCount: agg.transactionCount,
      totalCost: agg.totalCost,
      appProfit: agg.appProfit,
      markUpProfit: agg.markUpProfit,
      referralProfit: agg.referralProfit,
      totalTokens: agg.totalTokens,
      apiKeyCount: apiKeyCountMap.get(app.id) ?? 0,
      refreshTokenCount: refreshTokenCountMap.get(app.id) ?? 0,
      sentCampaigns: Array.from(sentMap.get(app.id) ?? []),
    });
  }

  return {
    apps: rows,
    pagination: {
      page,
      pageSize,
      total,
      hasMore: (page + 1) * pageSize < total,
    },
  };
}
