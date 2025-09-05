import { existsSync } from 'fs';
import { join } from 'path';
import type {
  ApiKeyValidationResult,
  EchoApp,
  Transaction,
  TransactionRequest,
  User,
} from '../types';
import { EchoDbService } from './DbService';

import { Decimal } from '@prisma/client/runtime/library';
import { PaymentRequiredError, UnauthorizedError } from '../errors/http';
import { PrismaClient, SpendPool } from '../generated/prisma';
import logger from '../logger';
import { EarningsService } from './EarningsService';
import FreeTierService from './FreeTierService';

export class EchoControlService {
  private readonly db: PrismaClient;
  private readonly dbService: EchoDbService;
  private readonly freeTierService: FreeTierService;
  private earningsService: EarningsService;
  private readonly apiKey: string;
  private authResult: ApiKeyValidationResult | null = null;
  private markUpAmount: Decimal | null = null;
  private markUpId: string | null = null;
  private referralAmount: Decimal | null = null;
  private referrerRewardId: string | null = null;
  private referralCodeId: string | null = null;
  private freeTierSpendPool: SpendPool | null = null;

  constructor(db: PrismaClient, apiKey: string) {
    // Check if the generated Prisma client exists
    const generatedPrismaPath = join(__dirname, '..', 'generated', 'prisma');
    if (!existsSync(generatedPrismaPath)) {
      throw new Error(
        `Generated Prisma client not found at ${generatedPrismaPath}. ` +
          'Please run "npm run copy-prisma" to copy the generated client from echo-control.'
      );
    }

    this.apiKey = apiKey;
    this.db = db;
    this.dbService = new EchoDbService(this.db);
    this.freeTierService = new FreeTierService(this.db);
    this.earningsService = new EarningsService(this.db);
  }

  /**
   * Verify API key against the database and cache the authentication result
   * Uses centralized logic from EchoDbService
   */
  async verifyApiKey(): Promise<ApiKeyValidationResult | null> {
    try {
      this.authResult = await this.dbService.validateApiKey(this.apiKey);
    } catch (error) {
      logger.error(`Error verifying API key: ${error}`);
      return null;
    }

    const markupData = await this.earningsService.getEarningsData(
      this.authResult,
      this.getEchoAppId() ?? ''
    );
    this.markUpAmount = markupData.markUpAmount;
    this.markUpId = markupData.markUpId;
    this.referrerRewardId = markupData.referralId;
    this.referralAmount = markupData.referralAmount;

    const echoAppId = this.authResult?.echoAppId;
    const userId = this.authResult?.userId;

    if (echoAppId && userId) {
      this.referralCodeId = await this.dbService.getReferralCodeForUser(
        userId,
        echoAppId
      );
    }

    return this.authResult;
  }

  /**
   * Get the cached authentication result
   */
  getAuthResult(): ApiKeyValidationResult | null {
    return this.authResult;
  }

  /**
   * Get the user ID from cached authentication result
   */
  getUserId(): string | null {
    return this.authResult?.userId ?? null;
  }

  /**
   * Get the echo app ID from cached authentication result
   */
  getEchoAppId(): string | null {
    return this.authResult?.echoAppId ?? null;
  }

  /**
   * Get the user from cached authentication result
   */
  getUser(): User | null {
    return this.authResult?.user ?? null;
  }

  /**
   * Get the echo app from cached authentication result
   */
  getEchoApp(): EchoApp | null {
    return this.authResult?.echoApp ?? null;
  }

  /**
   * Get balance for the authenticated user directly from the database
   * Uses centralized logic from EchoDbService
   */
  async getBalance(): Promise<number> {
    try {
      if (!this.authResult) {
        logger.error('No authentication result available');
        return 0;
      }

      const { userId } = this.authResult;
      const balance = await this.dbService.getBalance(userId);

      return balance.balance;
    } catch (error) {
      logger.error(`Error fetching balance: ${error}`);
      return 0;
    }
  }

  /**
   * Create an LLM transaction record directly in the database
   * Uses centralized logic from EchoDbService
   */
  async createTransaction(transaction: Transaction): Promise<void> {
    try {
      if (!this.authResult) {
        logger.error('No authentication result available');
        return;
      }

      if (!this.markUpAmount) {
        logger.error('Error Fetching Markup Amount');
        return;
      }

      if (this.freeTierSpendPool) {
        await this.createFreeTierTransaction(transaction);
        return;
      } else {
        await this.createPaidTransaction(transaction);
        return;
      }
    } catch (error) {
      logger.error(`Error creating transaction: ${error}`);
    }
  }

  async getOrNoneFreeTierSpendPool(
    userId: string,
    appId: string
  ): Promise<{ spendPool: SpendPool; effectiveBalance: number } | null> {
    const fetchSpendPoolInfo =
      await this.freeTierService.getOrNoneFreeTierSpendPool(appId, userId);
    if (fetchSpendPoolInfo) {
      this.freeTierSpendPool = fetchSpendPoolInfo.spendPool;
      return {
        spendPool: fetchSpendPoolInfo.spendPool,
        effectiveBalance: fetchSpendPoolInfo.effectiveBalance,
      };
    }
    return null;
  }

  async computeTransactionCosts(
    transaction: Transaction,
    referralCodeId: string | null
  ): Promise<{
    rawTransactionCost: Decimal;
    totalTransactionCost: Decimal;
    totalAppProfit: Decimal;
    referralProfit: Decimal;
    markUpProfit: Decimal;
  }> {
    if (!this.markUpAmount) {
      logger.error('User has not authenticated');
      throw new UnauthorizedError('User has not authenticated');
    }

    if (!this.referralAmount) {
      logger.error('Referral amount not found');
      throw new UnauthorizedError('Referral amount not found');
    }

    const markUpDecimal = this.markUpAmount.minus(1);
    const referralDecimal = this.referralAmount.minus(1);

    if (markUpDecimal.lessThan(0.0)) {
      logger.error('App markup must be greater than 1.0');
      throw new UnauthorizedError('App markup must be greater than 1.0');
    }

    if (referralDecimal.lessThan(0.0)) {
      logger.error('Referral amount must be greater than 1.0');
      throw new UnauthorizedError('Referral amount must be greater than 1.0');
    }

    const totalAppProfitDecimal =
      transaction.rawTransactionCost.mul(markUpDecimal);

    // If there is a referral code, calculate the referral profit
    // Otherwise, set the referral profit to 0
    const referralProfitDecimal = referralCodeId
      ? totalAppProfitDecimal.mul(referralDecimal)
      : new Decimal(0);

    const markUpProfitDecimal = totalAppProfitDecimal.minus(
      referralProfitDecimal
    );
    const totalTransactionCostDecimal = transaction.rawTransactionCost.plus(
      totalAppProfitDecimal
    );

    // Return Decimal values directly
    return {
      rawTransactionCost: transaction.rawTransactionCost,
      totalTransactionCost: totalTransactionCostDecimal,
      totalAppProfit: totalAppProfitDecimal,
      referralProfit: referralProfitDecimal,
      markUpProfit: markUpProfitDecimal,
    };
  }
  async createFreeTierTransaction(transaction: Transaction): Promise<void> {
    if (!this.authResult) {
      logger.error('No authentication result available');
      throw new UnauthorizedError('No authentication result available');
    }

    if (!this.freeTierSpendPool) {
      logger.error('No free tier spend pool available');
      throw new PaymentRequiredError('No free tier spend pool available');
    }

    const { userId, echoAppId, apiKeyId } = this.authResult;
    if (!userId || !echoAppId) {
      logger.error('Missing required user or app information');
      throw new UnauthorizedError('Missing required user or app information');
    }

    const {
      rawTransactionCost,
      totalTransactionCost,
      totalAppProfit,
      referralProfit,
      markUpProfit,
    } = await this.computeTransactionCosts(transaction, this.referralCodeId);

    const transactionData: TransactionRequest = {
      totalCost: totalTransactionCost,
      appProfit: totalAppProfit,
      markUpProfit: markUpProfit,
      referralProfit: referralProfit,
      rawTransactionCost: rawTransactionCost,
      metadata: transaction.metadata,
      status: transaction.status,
      userId: userId,
      echoAppId: echoAppId,
      ...(apiKeyId && { apiKeyId }),
      ...(this.markUpId && { markUpId: this.markUpId }),
      ...(this.freeTierSpendPool.id && {
        spendPoolId: this.freeTierSpendPool.id,
      }),
      ...(this.referralCodeId && { referralCodeId: this.referralCodeId }),
      ...(this.referrerRewardId && { referrerRewardId: this.referrerRewardId }),
    };

    await this.freeTierService.createFreeTierTransaction(
      transactionData,
      this.freeTierSpendPool.id
    );
  }

  async createPaidTransaction(transaction: Transaction): Promise<void> {
    if (!this.authResult) {
      logger.error('No authentication result available');
      throw new UnauthorizedError('No authentication result available');
    }

    const {
      rawTransactionCost,
      totalTransactionCost,
      totalAppProfit,
      referralProfit,
      markUpProfit,
    } = await this.computeTransactionCosts(transaction, this.referralCodeId);

    const { userId, echoAppId, apiKeyId } = this.authResult;

    const transactionData: TransactionRequest = {
      totalCost: totalTransactionCost,
      appProfit: totalAppProfit,
      markUpProfit: markUpProfit,
      referralProfit: referralProfit,
      rawTransactionCost: rawTransactionCost,
      metadata: transaction.metadata,
      status: transaction.status,
      userId: userId,
      echoAppId: echoAppId,
      ...(apiKeyId && { apiKeyId }),
      ...(this.markUpId && { markUpId: this.markUpId }),
      ...(this.referralCodeId && { referralCodeId: this.referralCodeId }),
      ...(this.referrerRewardId && { referrerRewardId: this.referrerRewardId }),
    };

    await this.dbService.createPaidTransaction(transactionData);
  }
}
