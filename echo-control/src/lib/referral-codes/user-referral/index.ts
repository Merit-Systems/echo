import { db } from '@/lib/db';
import { ReferralReward } from '@/generated/prisma';
import { Prisma } from '@/generated/prisma';
import { ReferralCodeType, UserReferralCode } from '../types';

export async function setAppReferralReward(
  userId: string,
  echoAppId: string,
  reward: number
): Promise<void> {
  await db.$transaction(async tx => {
    const echoApp = await db.echoApp.findUnique({
      where: {
        id: echoAppId,
        appMemberships: {
          some: {
            userId,
            role: {
              equals: 'owner',
            },
          },
        },
      },
    });

    if (!echoApp) {
      throw new Error('EchoApp not found');
    }

    // Create a new referral reward record
    const newReferralReward = await tx.referralReward.create({
      data: {
        echoAppId: echoAppId,
        amount: reward,
        description: 'App referral reward',
        isArchived: false,
      },
    });

    // Update the EchoApp to reference this new reward as the current one
    await tx.echoApp.update({
      where: { id: echoAppId },
      data: {
        currentReferralRewardId: newReferralReward.id,
      },
    });
  });
}

export async function getCurrentReferralReward(
  userId: string,
  echoAppId: string,
  tx?: Prisma.TransactionClient
): Promise<ReferralReward | null> {
  const client = tx ?? db;

  const echoApp = await client.echoApp.findUnique({
    where: {
      id: echoAppId,
      appMemberships: { some: { userId, role: { equals: 'owner' } } },
    },
    include: {
      currentReferralReward: true,
    },
  });

  if (!echoApp) {
    throw new Error('EchoApp not found');
  }

  return echoApp.currentReferralReward ?? null;
}

export async function mintUserReferralCode(
  userId: string,
  echoAppId: string,
  expiresAt?: Date,
  tx?: Prisma.TransactionClient
): Promise<UserReferralCode> {
  const code = crypto.randomUUID();

  const client = tx ?? db;

  // Set default expiration to 1 year from now if not provided
  const defaultExpiresAt =
    expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const referralCode = await client.referralCode.create({
    data: {
      code,
      echoAppId,
      userId,
      grantType: ReferralCodeType.REFERRAL,
      reusable: true,
      expiresAt: defaultExpiresAt,
    },
    include: {
      echoApp: true,
    },
  });

  const referralLinkUrl = getReferralLinkUrlForUser(
    referralCode.echoApp?.homepageUrl,
    echoAppId,
    code
  );

  return {
    code: referralCode.code,
    expiresAt: referralCode.expiresAt,
    userId: referralCode.userId,
    echoAppId: referralCode.echoAppId,
    referralLinkUrl,
  };
}

export async function getReferralCodesForUser(
  userId: string,
  echoAppId: string,
  tx?: Prisma.TransactionClient
): Promise<UserReferralCode[]> {
  const client = tx ?? db;

  const referralCodes = await client.referralCode.findMany({
    where: {
      userId,
      echoAppId,
      grantType: ReferralCodeType.REFERRAL,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      echoApp: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert to UserReferralCode format with referral link URLs
  const userReferralCodes = referralCodes.map(referralCode => {
    const referralLinkUrl = getReferralLinkUrlForUser(
      referralCode.echoApp?.homepageUrl,
      echoAppId,
      referralCode.code
    );

    return {
      code: referralCode.code,
      expiresAt: referralCode.expiresAt,
      userId: referralCode.userId,
      echoAppId: referralCode.echoAppId,
      referralLinkUrl,
    };
  });

  return userReferralCodes;
}

export async function setUserReferrerForAppIfExists(
  userId: string,
  echoAppId: string,
  code: string,
  tx?: Prisma.TransactionClient
): Promise<boolean> {
  const client = tx ?? db;

  const appMembership = await client.appMembership.findUnique({
    where: {
      userId_echoAppId: {
        userId,
        echoAppId,
      },
    },
    select: {
      referrerId: true,
    },
  });

  if (appMembership?.referrerId) {
    // If the user already has a referrer, return false
    return false;
  }

  const referralCode = await client.referralCode.findUnique({
    where: {
      code,
      grantType: ReferralCodeType.REFERRAL,
      echoAppId: echoAppId,
    },
  });

  if (!referralCode) {
    return false;
  }

  if (referralCode.userId === userId) {
    // user can't refer themselves
    return false;
  }

  await client.appMembership.update({
    where: {
      userId_echoAppId: {
        userId,
        echoAppId,
      },
    },
    data: {
      referrerId: referralCode.id,
    },
  });

  await client.referralCode.update({
    where: { id: referralCode.id },
    data: {
      usedAt: new Date(),
    },
  });

  return true;
}

export function getReferralLinkUrlForUser(
  homePage: string | null | undefined,
  echoAppId: string,
  code: string
): string {
  return `${homePage || `${process.env.ECHO_CONTROL_APP_BASE_URL}/apps/${echoAppId}`}?referralCode=${code}`;
}
