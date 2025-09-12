import { db } from '@/lib/db';
import { z } from 'zod';

import type { AppId } from './lib/schemas';

export const getAppReferralReward = async (appId: AppId) => {
  const app = await db.echoApp.findUnique({
    where: {
      id: appId,
      isArchived: false,
    },
    include: {
      currentReferralReward: true,
    },
  });

  if (!app) {
    return null;
  }

  const { currentReferralReward } = app;

  if (!currentReferralReward) {
    return null;
  }

  return {
    ...currentReferralReward,
    amount: Number(currentReferralReward.amount),
  };
};

export const setAppReferralRewardSchema = z.object({
  percentage: z
    .number()
    .min(0, { message: 'Referral bonus must be greater than 0%' })
    .max(100, { message: 'Referral bonus must be less than 100%' }),
});

export async function setAppReferralReward(
  appId: AppId,
  userId: string,
  input: z.infer<typeof setAppReferralRewardSchema>
): Promise<void> {
  const echoApp = await db.echoApp.findUnique({
    where: {
      id: appId,
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
    throw new Error('User is not an owner of the app');
  }

  await db.$transaction(async tx => {
    // Create a new referral reward record
    const newReferralReward = await tx.referralReward.create({
      data: {
        amount: input.percentage / 100 + 1,
        description: 'App referral reward',
        echoAppId: appId,
        isArchived: false,
      },
    });

    // Update the EchoApp to reference this new reward as the current one
    await tx.echoApp.update({
      where: { id: appId },
      data: {
        currentReferralRewardId: newReferralReward.id,
      },
    });
  });
}
