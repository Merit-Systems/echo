import { db } from '@/lib/db';

export enum PayoutType {
  REFERRAL = 'referral',
  MARKUP = 'markup',
}

export enum PayoutStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

interface UserReferralEarnings {
  byApp: Record<string, number>;
  total: number;
  apps?: Record<
    string,
    {
      id: string;
      name: string;
      profilePictureUrl: string | null;
    }
  >;
}

export async function calculateUserReferralEarnings(
  userId: string
): Promise<UserReferralEarnings> {
  // 1) Find all referral codes owned by the user
  const userReferralCodes = await db.referralCode.findMany({
    where: { userId, isArchived: false },
    select: { id: true },
  });

  if (userReferralCodes.length === 0) {
    return { byApp: {}, total: 0, apps: {} };
  }

  const referralCodeIds = userReferralCodes.map(c => c.id);

  // 2) Find all transactions linked to those codes and
  // 3) Aggregate by app while computing the total
  const groupedByApp = await db.transaction.groupBy({
    by: ['echoAppId'],
    where: {
      isArchived: false,
      referralCodeId: { in: referralCodeIds },
    },
    _sum: { referralProfit: true },
  });

  // Sum previously claimed payouts per app for this user (type = 'referral')
  const claimedByApp = await db.payout.groupBy({
    by: ['echoAppId'],
    where: {
      type: 'referral',
      userId,
      echoAppId: { not: null },
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
    const gross = row._sum.referralProfit ? Number(row._sum.referralProfit) : 0;
    const claimed = claimedMap[row.echoAppId] || 0;
    const net = Math.max(0, gross - claimed);
    byApp[row.echoAppId] = net;
  }

  const total = Object.values(byApp).reduce((sum, v) => sum + v, 0);

  // Fetch app details for the apps present in byApp mapping
  const appIds = Object.keys(byApp);
  const appsList = appIds.length
    ? await db.echoApp.findMany({
        where: { id: { in: appIds } },
        select: { id: true, name: true, profilePictureUrl: true },
      })
    : [];

  const apps: NonNullable<UserReferralEarnings['apps']> = {};
  for (const app of appsList) {
    apps[app.id] = {
      id: app.id,
      name: app.name,
      profilePictureUrl: app.profilePictureUrl ?? null,
    };
  }

  return { byApp, total, apps };
}

export async function calculateUserReferralEarningsForApp(
  userId: string,
  echoAppId: string
): Promise<number> {
  const userReferralCodes = await db.referralCode.findMany({
    where: { userId, isArchived: false },
    select: { id: true },
  });

  if (userReferralCodes.length === 0) {
    return 0;
  }

  const referralCodeIds = userReferralCodes.map(c => c.id);

  const result = await db.transaction.aggregate({
    where: {
      isArchived: false,
      echoAppId,
      referralCodeId: { in: referralCodeIds },
    },
    _sum: { referralProfit: true },
  });

  const gross = result._sum.referralProfit
    ? Number(result._sum.referralProfit)
    : 0;

  const claimed = await db.payout.aggregate({
    where: {
      type: 'referral',
      userId,
      echoAppId,
    },
    _sum: { amount: true },
  });

  const claimedAmount = claimed._sum.amount ? Number(claimed._sum.amount) : 0;
  return Math.max(0, gross - claimedAmount);
}

export async function claimReferralRewardForApp(
  userId: string,
  echoAppId: string
) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.referralGithubUserId) {
    throw new Error('User has no referral Github user ID');
  }

  const githubLink = await db.githubLink.findUnique({
    where: { id: user.referralGithubUserId },
  });

  if (!githubLink) {
    throw new Error('Github link not found');
  }

  const amountToClaim = await calculateUserReferralEarningsForApp(
    userId,
    echoAppId
  );
  if (amountToClaim <= 0) {
    throw new Error('No referral earnings available to claim');
  }

  const payout = await db.payout.create({
    data: {
      amount: amountToClaim,
      status: PayoutStatus.PENDING,
      type: PayoutType.REFERRAL,
      description: 'Referral payout claim',
      recipientGithubLinkId: githubLink.id,
      userId,
      echoAppId,
    },
  });

  return payout;
}

export async function claimAllReferralRewards(
  userId: string
): Promise<{ id: string; echoAppId: string; amount: number }[]> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.referralGithubUserId) {
    throw new Error('User has no referral Github user ID');
  }

  const githubLink = await db.githubLink.findUnique({
    where: { id: user.referralGithubUserId },
  });
  if (!githubLink) {
    throw new Error('Github link not found');
  }

  const earnings = await calculateUserReferralEarnings(userId);
  const entries = Object.entries(earnings.byApp).filter(
    ([, amount]) => amount > 0
  );

  if (entries.length === 0) {
    return [];
  }

  const created = await db.$transaction(
    entries.map(([appId, amount]) =>
      db.payout.create({
        data: {
          amount,
          status: PayoutStatus.PENDING,
          type: PayoutType.REFERRAL,
          description: 'Referral payout claim (bulk)',
          recipientGithubLinkId: githubLink.id,
          userId,
          echoAppId: appId,
        },
        select: { id: true, echoAppId: true, amount: true },
      })
    )
  );

  return created.map(p => ({
    id: p.id,
    echoAppId: p.echoAppId!,
    amount: Number(p.amount),
  }));
}
