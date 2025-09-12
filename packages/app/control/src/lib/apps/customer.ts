import { db } from '@/lib/db';
import { CustomerEchoApp } from './types';
import { getOwnerDetails } from './owner';
import { getCustomerStatistics } from './customer-statistics';

/**
 * Get customer echo app with personal and global statistics
 * @param id - The ID of the echo app
 * @param userId - The ID of the customer/user
 * @returns Customer echo app with owner details and customer statistics
 */
export async function getCustomerEchoApp(
  id: string,
  userId: string
): Promise<CustomerEchoApp> {
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
        currentReferralReward: {
          select: {
            id: true,
            amount: true,
            description: true,
          },
        },
        currentReferralRewardId: true,
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

    // Get customer statistics (includes both global and personal stats)
    const stats = await getCustomerStatistics(id, userId, tx);

    // Construct and return the customer echo app
    return {
      ...echoApp,
      owner,
      stats,
      type: 'customer',
    };
  });
}
