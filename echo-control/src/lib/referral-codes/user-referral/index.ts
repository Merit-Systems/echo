import { db } from '@/lib/db';
import type { Prisma } from '@/generated/prisma';
import { ReferralCodeType } from '../types';

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
