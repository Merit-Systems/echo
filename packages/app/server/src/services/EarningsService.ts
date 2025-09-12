import { ApiKeyValidationResult } from '../types';
import { MarkUp, ReferralReward, PrismaClient } from '../generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import logger from '../logger';

type MarkUpData = MarkUp | null;

type ReferralRewardData = ReferralReward | null;

type ValidationResult = {
  amount: Decimal;
  id: string | null;
};

export class EarningsService {
  constructor(private readonly db: PrismaClient) {}
  async getEarningsData(
    authResult: ApiKeyValidationResult | null,
    echoAppId: string
  ): Promise<{
    markUpId: string | null;
    markUpAmount: Decimal;
    referralId: string | null;
    referralAmount: Decimal;
  }> {
    if (!authResult) {
      logger.error('No authentication result available');
      return {
        markUpId: null,
        markUpAmount: new Decimal(1.0),
        referralId: null,
        referralAmount: new Decimal(1.0),
      };
    }

    // Single database transaction to fetch both markup and referral reward data
    const appData = await this.db.echoApp.findUnique({
      where: {
        id: echoAppId,
      },
      select: {
        markUp: true,
        currentReferralReward: true,
      },
    });

    if (!appData) {
      throw new Error('EchoApp not found');
    }

    // Validate markup
    const markup = this.validateMarkup(appData.markUp);

    // Validate referral reward
    const referralReward = this.validateReferralReward(
      appData.currentReferralReward
    );

    return {
      markUpId: markup.id,
      markUpAmount: markup.amount,
      referralId: referralReward.id,
      referralAmount: referralReward.amount,
    };
  }

  private validateMarkup(markUp: MarkUpData): ValidationResult {
    // If no markup record exists, return default
    if (!markUp) {
      return { amount: new Decimal(1.0), id: null };
    }

    if (markUp.isArchived) {
      return { amount: new Decimal(1.0), id: null };
    }

    if (!markUp.amount) {
      return { amount: new Decimal(1.0), id: null };
    }

    if (markUp.amount.lt(1.0)) {
      throw new Error('App markup must be greater than or equal to 1.0');
    }

    return {
      amount: markUp.amount,
      id: markUp.id,
    };
  }

  private validateReferralReward(
    currentReferralReward: ReferralRewardData
  ): ValidationResult {
    if (!currentReferralReward) {
      return { amount: new Decimal(1.0), id: null };
    }

    return {
      amount: currentReferralReward.amount,
      id: currentReferralReward.id,
    };
  }
}
