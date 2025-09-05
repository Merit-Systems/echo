import {
  PrismaClient,
  SpendPool,
  UserSpendPoolUsage,
} from '../generated/prisma';
import { TransactionRequest } from '../types';
import { EchoDbService } from './DbService';

class FreeTierService {
  private readonly dbService: EchoDbService;

  constructor(private readonly db: PrismaClient) {
    this.dbService = new EchoDbService(db);
  }

  checkValidFreeTierSpendPool(
    spendPool: SpendPool & { userUsage: UserSpendPoolUsage[] }
  ): { valid: boolean; effectiveBalance: number } {
    const spendPoolBalance =
      Number(spendPool.totalPaid) - Number(spendPool.totalSpent);
    const spendPoolHasBalance = spendPoolBalance > 0;

    const existingUserUsage: UserSpendPoolUsage | undefined =
      spendPool.userUsage[0] || undefined;

    if (!spendPoolHasBalance) {
      return { valid: false, effectiveBalance: 0 };
    }

    if (!existingUserUsage) {
      const effectiveBalance = Math.min(
        Number(spendPool.perUserSpendLimit) || 0,
        spendPoolBalance
      );
      return { valid: true, effectiveBalance: effectiveBalance };
    }

    return this.checkExistingUserUsage(
      existingUserUsage,
      spendPoolBalance,
      Number(spendPool.perUserSpendLimit) || null
    );
  }

  checkExistingUserUsage(
    userUsage: UserSpendPoolUsage,
    spendPoolBalance: number,
    perUserSpendLimit: number | null
  ): { valid: boolean; effectiveBalance: number } {
    if (!perUserSpendLimit) {
      return { valid: true, effectiveBalance: spendPoolBalance };
    }

    if (perUserSpendLimit && Number(userUsage.totalSpent) < perUserSpendLimit) {
      return {
        valid: true,
        effectiveBalance: perUserSpendLimit - Number(userUsage.totalSpent),
      };
    }

    return { valid: false, effectiveBalance: 0 };
  }

  async getOrNoneFreeTierSpendPool(
    appId: string,
    userId: string
  ): Promise<{
    spendPool: SpendPool & { userUsage: UserSpendPoolUsage[] };
    effectiveBalance: number;
  } | null> {
    // First, find all non-archived spend pools for the app
    const spendPool = await this.db.spendPool.findFirst({
      where: {
        echoAppId: appId,
        isArchived: false,
      },
      include: {
        userUsage: {
          where: {
            userId: userId,
          },
        },
      },
    });

    if (!spendPool) {
      return null;
    }

    const { valid, effectiveBalance } =
      this.checkValidFreeTierSpendPool(spendPool);

    return valid ? { spendPool, effectiveBalance } : null;
  }
  /**
   * Create a free tier transaction and update all related records atomically
   * Delegates to DbService for shared transaction logic
   */
  async createFreeTierTransaction(
    transactionData: TransactionRequest,
    spendPoolId: string
  ) {
    // Delegate to the centralized DbService method
    return await this.dbService.createFreeTierTransaction(
      transactionData,
      spendPoolId
    );
  }
}

export default FreeTierService;
