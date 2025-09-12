import { db } from '@/lib/db';
import { PublicEchoApp } from './types';
import { getOwnerDetails } from './owner';
import { getGlobalStatistics } from './global-statistics';

export async function getPublicEchoApp(id: string): Promise<PublicEchoApp> {
  // Use a transaction to ensure consistency
  return await db.$transaction(async tx => {
    // Get the base echo app
    const echoApp = await tx.echoApp.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        profilePictureUrl: true,
        bannerImageUrl: true,
        homepageUrl: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        currentReferralRewardId: true,
        currentReferralReward: {
          select: {
            id: true,
            amount: true,
            description: true,
          },
        },
      },
    });

    if (!echoApp) {
      throw new Error('Echo app not found');
    }

    // Get owner details
    const owner = await getOwnerDetails(id, tx);
    if (!owner) {
      throw new Error('Echo app owner not found');
    }

    // Get global statistics
    const stats = await getGlobalStatistics(id, tx);

    // Construct and return the public echo app
    return {
      ...echoApp,
      owner,
      stats,
      type: 'public',
    } as PublicEchoApp;
  });
}
