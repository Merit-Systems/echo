import { db } from '@/lib/db';
import { ReferralCodeType } from '../types';
import { mintCreditsToUser } from '@/services/credits';
import { EnumPaymentSource } from '@/generated/prisma';

export async function redeemCreditReferralCode(
  userId: string,
  code: string,
  freeTier = false,
  echoAppId?: string
): Promise<{
  userId: string;
  amountInDollars: number;
  echoAppId: string | undefined;
  isFreeTier: boolean;
}> {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return await db.$transaction(async tx => {
    const referralCode = await tx.referralCode.findUnique({
      where: {
        code,
        expiresAt: { gt: new Date() },
        isUsed: false,
        isArchived: false,
        grantType: ReferralCodeType.CREDITS,
        grantAmount: { not: null },
      },
    });

    if (!referralCode) {
      throw new Error('Referral code not found or expired');
    }

    if (!referralCode.grantAmount) {
      throw new Error('Referral code has no grant amount');
    }

    await tx.referralCode.update({
      where: { id: referralCode.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    const {
      userId: userIdFromMintCredits,
      amountInDollars,
      echoAppId: echoAppIdFromReferralCode,
      isFreeTier,
    } = await mintCreditsToUser(
      {
        userId,
        amountInDollars: Number(referralCode.grantAmount),
        options: {
          isFreeTier: freeTier,
          echoAppId,
          source: EnumPaymentSource.admin,
        },
      },
      tx
    );

    return {
      userId: userIdFromMintCredits,
      amountInDollars,
      echoAppId: echoAppIdFromReferralCode,
      isFreeTier,
    };
  });
}
