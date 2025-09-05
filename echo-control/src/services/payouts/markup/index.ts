import { db } from '@/lib/db';
import { PayoutStatus, PayoutType } from '@/services/payouts/referrals';

export interface AppMarkupEarnings {
  byApp: Record<string, number>;
  total: number;
  appMeta: Record<
    string,
    {
      appId: string;
      name: string;
      profilePictureUrl: string | null;
      githubLink: {
        id: string;
        githubId: number;
        githubType: 'user' | 'repo';
        githubUrl: string;
      } | null;
    }
  >;
}

export async function calculateAppMarkupEarnings(
  echoAppId: string
): Promise<number> {
  const grossResult = await db.transaction.aggregate({
    where: {
      isArchived: false,
      echoAppId,
    },
    _sum: { markUpProfit: true },
  });

  const gross = grossResult._sum.markUpProfit
    ? Number(grossResult._sum.markUpProfit)
    : 0;

  const claimedResult = await db.payout.aggregate({
    where: {
      type: PayoutType.MARKUP,
      echoAppId,
    },
    _sum: { amount: true },
  });

  const claimed = claimedResult._sum.amount
    ? Number(claimedResult._sum.amount)
    : 0;

  return Math.max(0, gross - claimed);
}

export async function calculateUserMarkupEarnings(
  userId: string
): Promise<AppMarkupEarnings> {
  // Find all apps where the user is an owner
  const ownedApps = await db.appMembership.findMany({
    where: {
      userId,
      role: 'owner',
      isArchived: false,
    },
    select: { echoAppId: true },
  });

  if (ownedApps.length === 0) {
    return { byApp: {}, total: 0, appMeta: {} };
  }

  const appIds = ownedApps.map(a => a.echoAppId);

  // Sum markup by app
  const groupedByApp = await db.transaction.groupBy({
    by: ['echoAppId'],
    where: {
      isArchived: false,
      echoAppId: { in: appIds },
    },
    _sum: { markUpProfit: true },
  });

  // Sum previously claimed payouts (type = 'markup') per app
  const claimedByApp = await db.payout.groupBy({
    by: ['echoAppId'],
    where: {
      type: PayoutType.MARKUP,
      echoAppId: { in: appIds },
    },
    _sum: { amount: true },
  });

  const claimedMap: Record<string, number> = {};
  for (const row of claimedByApp) {
    if (row.echoAppId) {
      claimedMap[row.echoAppId] = row._sum.amount ? Number(row._sum.amount) : 0;
    }
  }

  const byApp: Record<string, number> = {};
  for (const row of groupedByApp) {
    const gross = row._sum.markUpProfit ? Number(row._sum.markUpProfit) : 0;
    const claimed = claimedMap[row.echoAppId] || 0;
    const net = Math.max(0, gross - claimed);
    byApp[row.echoAppId] = net;
  }

  const total = Object.values(byApp).reduce((sum, v) => sum + v, 0);

  // Load app metadata (name, profile picture, github link) for display
  const apps = await db.echoApp.findMany({
    where: { id: { in: appIds } },
    select: {
      id: true,
      name: true,
      profilePictureUrl: true,
      githubLink: {
        select: { id: true, githubId: true, githubType: true, githubUrl: true },
      },
    },
  });

  const appMeta: AppMarkupEarnings['appMeta'] = {};
  for (const app of apps) {
    appMeta[app.id] = {
      appId: app.id,
      name: app.name,
      profilePictureUrl: app.profilePictureUrl,
      githubLink: app.githubLink
        ? {
            id: app.githubLink.id,
            githubId: app.githubLink.githubId,
            githubType: app.githubLink.githubType as 'user' | 'repo',
            githubUrl: app.githubLink.githubUrl,
          }
        : null,
    };
  }

  return { byApp, total, appMeta };
}

export async function claimMarkupRewardForApp(
  userId: string,
  echoAppId: string
) {
  // Ensure caller is the owner of the app
  const ownerMembership = await db.appMembership.findFirst({
    where: {
      userId,
      echoAppId,
      role: 'owner',
      isArchived: false,
    },
    select: { id: true },
  });

  if (!ownerMembership) {
    throw new Error('Only the app owner can claim markup earnings');
  }

  const githubLink = await db.githubLink.findUnique({
    where: { echoAppId },
  });

  if (!githubLink) {
    throw new Error('App GitHub link not found');
  }

  const amountToClaim = await calculateAppMarkupEarnings(echoAppId);
  if (amountToClaim <= 0) {
    throw new Error('No markup earnings available to claim');
  }

  const payout = await db.payout.create({
    data: {
      amount: amountToClaim,
      status: PayoutStatus.PENDING,
      type: PayoutType.MARKUP,
      description: 'Markup payout claim',
      recipientGithubLinkId: githubLink.id,
      userId,
      echoAppId,
    },
  });

  return payout;
}

export async function claimAllMarkupRewards(
  userId: string
): Promise<{ id: string; echoAppId: string; amount: number }[]> {
  // Find all owned apps
  const ownedApps = await db.appMembership.findMany({
    where: {
      userId,
      role: 'owner',
      isArchived: false,
    },
    select: { echoAppId: true },
  });

  if (ownedApps.length === 0) {
    return [];
  }

  const appIds = ownedApps.map(a => a.echoAppId);

  // Preload GitHub links for owned apps
  const githubLinks = await db.githubLink.findMany({
    where: { echoAppId: { in: appIds } },
    select: { id: true, echoAppId: true },
  });
  const githubLinkByApp: Record<string, string> = {};
  for (const link of githubLinks) {
    if (link.echoAppId) {
      githubLinkByApp[link.echoAppId] = link.id;
    }
  }

  const earnings = await calculateUserMarkupEarnings(userId);
  const entries = Object.entries(earnings.byApp).filter(
    ([, amount]) => amount > 0
  );

  if (entries.length === 0) {
    return [];
  }

  const created = await db.$transaction(
    entries.map(([appId, amount]) => {
      const linkId = githubLinkByApp[appId];
      if (!linkId) {
        throw new Error(`App GitHub link not found for app ${appId}`);
      }
      return db.payout.create({
        data: {
          amount,
          status: PayoutStatus.PENDING,
          type: PayoutType.MARKUP,
          description: 'Markup payout claim (bulk)',
          recipientGithubLinkId: linkId,
          userId,
          echoAppId: appId,
        },
        select: { id: true, echoAppId: true, amount: true },
      });
    })
  );

  return created.map(p => ({
    id: p.id,
    echoAppId: p.echoAppId as string,
    amount: Number(p.amount),
  }));
}
