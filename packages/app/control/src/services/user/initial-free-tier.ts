import { db } from '@/lib/db';
import { mintCreditsToUser } from '@/services/credits/mint';
import { EnumPaymentSource, User } from '@/generated/prisma';
import { env } from '@/env';

export const issueInitialFreeTierCredits = async (
  userId: string
): Promise<{ minted: boolean; amountInDollars: number; user: User }> => {
  const version = env.LATEST_FREE_TIER_CREDITS_ISSUANCE_VERSION;
  const amount = env.LATEST_FREE_TIER_CREDITS_ISSUANCE_AMOUNT;

  return await db.$transaction(async tx => {
    const existing = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new Error('User not found');
    }

    // If already issued for this version, no-op
    if (existing.latestFreeCreditsVersion?.toNumber() === version) {
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
            issuanceVersion: version.toString(),
            issuanceSource: 'initial-free-tier',
          },
          description: 'Welcome to Echo!',
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
  return (
    existing?.latestFreeCreditsVersion?.toNumber() ===
    env.LATEST_FREE_TIER_CREDITS_ISSUANCE_VERSION
  );
};
