import { db } from '@/lib/db';
import { mintCreditsToUser } from '@/services/credits';
import type { User } from '@/generated/prisma';
import { EnumPaymentSource } from '@/generated/prisma';

export const issueInitialFreeTierCredits = async (
  userId: string
): Promise<{ minted: boolean; amountInDollars: number; user: User }> => {
  const version = process.env.LATEST_FREE_TIER_CREDITS_ISSUANCE_VERSION;
  const amountStr = process.env.LATEST_FREE_TIER_CREDITS_ISSUANCE_AMOUNT;

  if (!version) {
    throw new Error('LATEST_FREE_TIER_CREDITS_ISSUANCE_VERSION is not set');
  }

  if (!amountStr) {
    throw new Error('LATEST_FREE_TIER_CREDITS_ISSUANCE_AMOUNT is not set');
  }

  const amount = Number.parseFloat(amountStr);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      'LATEST_FREE_TIER_CREDITS_ISSUANCE_AMOUNT must be a positive number'
    );
  }

  return await db.$transaction(async tx => {
    const existing = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new Error('User not found');
    }

    const currentVersion = existing.latestFreeCreditsVersion
      ? existing.latestFreeCreditsVersion.toString()
      : null;

    // If already issued for this version, no-op
    if (currentVersion === version) {
      return {
        minted: false,
        amountInDollars: amount,
        user: existing,
      };
    }

    await mintCreditsToUser(
      {
        userId,
        amountInDollars: amount,
        options: {
          // Issue to personal balance (not tied to an app-level free tier pool)
          isFreeTier: false,
          metadata: {
            issuanceVersion: version,
            issuanceSource: 'initial-free-tier',
          },
          description: 'Initial Free-Tier Credits Issuance',
          source: EnumPaymentSource.signUpGift,
        },
      },
      tx
    );

    const updated = await tx.user.update({
      where: { id: userId },
      data: { latestFreeCreditsVersion: version },
    });

    return {
      minted: true,
      amountInDollars: amount,
      user: updated,
    };
  });
};

export const hasClaimedInitialFreeTierCredits = async (
  userId: string
): Promise<boolean> => {
  const existing = await db.user.findUnique({ where: { id: userId } });
  return Boolean(
    process.env.LATEST_FREE_TIER_CREDITS_ISSUANCE_VERSION &&
      existing?.latestFreeCreditsVersion &&
      existing.latestFreeCreditsVersion.toString() ===
        process.env.LATEST_FREE_TIER_CREDITS_ISSUANCE_VERSION
  );
};
