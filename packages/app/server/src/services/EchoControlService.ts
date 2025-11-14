import { existsSync } from 'fs';
import { join } from 'path';
import { ok, err, ResultAsync } from 'neverthrow';
import type {
  ApiKeyValidationResult,
  EchoApp,
  Transaction,
  TransactionCosts,
  TransactionRequest,
  User,
  X402AuthenticationResult,
} from '../types';
import { EchoDbService } from './DbService';

import { Decimal } from '@prisma/client/runtime/library';
import { 
  AppResult, 
  AppResultAsync,
  InvalidApiKeyError,
  ConfigurationError,
  DatabaseError,
  AuthenticationError,
  ValidationError,
  PaymentRequiredError,
  safeAsync
} from '../errors';
import {
  EnumTransactionType,
  MarkUp,
  PrismaClient,
  SpendPool,
} from '../generated/prisma';
import logger from '../logger';
import { EarningsService } from './EarningsService';
import FreeTierService from './FreeTierService';
import { applyEchoMarkup } from './PricingService';

export class EchoControlService {
  private readonly db: PrismaClient;
  private readonly dbService: EchoDbService;
  private readonly freeTierService: FreeTierService;
  private earningsService: EarningsService;
  private readonly apiKey: string | undefined;
  private authResult: ApiKeyValidationResult | null = null;
  private x402AuthenticationResult: X402AuthenticationResult | null = null;
  private markUpAmount: Decimal | null = null;
  private markUpId: string | null = null;
  private referralAmount: Decimal | null = null;
  private referrerRewardId: string | null = null;
  private referralCodeId: string | null = null;
  private freeTierSpendPool: SpendPool | null = null;

  constructor(db: PrismaClient, apiKey?: string) {
    const generatedPrismaPath = join(__dirname, 'generated', 'prisma');
    if (!existsSync(generatedPrismaPath)) {
      logger.error('Generated Prisma client not found', { path: generatedPrismaPath });
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
    const generatedPrismaPath = join(__dirname, 'generated', 'prisma');
    if (!existsSync(generatedPrismaPath)) {
      logger.error('Cannot verify API key: Prisma client not found');
      return null;
    }

    if (!this.apiKey) {
      logger.error('No API key provided');
      return null;
    }

    try {
      this.authResult = await this.dbService.validateApiKey(this.apiKey);
      
      if (!this.authResult) {
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
      const referralResult = await this.dbService.getReferralCodeForUser(
        userId,
        echoAppId
      );
      
      if (referralResult.isOk()) {
        this.referralCodeId = referralResult.value;
      } else {
        logger.error('Failed to get referral code', { error: referralResult.error });
        this.referralCodeId = null;
      }
    }

      return this.authResult;
    } catch (error) {
      logger.error(`Error verifying API key: ${error}`);
      return null;
    }
  }

  identifyX402Request(echoApp: EchoApp | null, markUp: MarkUp | null): void {
    if (echoApp) {
      this.x402AuthenticationResult = {
        echoApp: echoApp,
        echoAppId: echoApp.id,
      };
    }

    if (markUp) {
      this.markUpAmount = markUp.amount;
      this.markUpId = markUp.id;
    } else {
      this.markUpAmount = new Decimal(1.0);
      this.markUpId = null;
    }

    this.referralAmount = new Decimal(1.0);
    this.referrerRewardId = null;
    this.referralCodeId = null;
    this.freeTierSpendPool = null;
    this.referralCodeId = null;
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
   * Returns Result with balance or error
   */
  async getBalance(): Promise<AppResult<number, AuthenticationError | DatabaseError>> {
    if (!this.authResult) {
      logger.error('No authentication result available');
      return err(new AuthenticationError('Not authenticated'));
    }

    const { userId } = this.authResult;
    const balanceResult = await this.dbService.getBalance(userId);
    
    if (balanceResult.isErr()) {
      return err(balanceResult.error);
    }
    
    return ok(balanceResult.value.balance);
  }

  /**
   * Create an LLM transaction record directly in the database
   * Uses centralized logic from EchoDbService
   */
  async createTransaction(transaction: Transaction): Promise<AppResult<void, AuthenticationError | ValidationError | DatabaseError | PaymentRequiredError>> {
    if (!this.authResult) {
      logger.error('No authentication result available');
      return err(new AuthenticationError('Not authenticated'));
    }

    if (!this.markUpAmount) {
      logger.error('Error Fetching Markup Amount');
      return err(new ValidationError('Markup amount not available'));
    }

    if (this.freeTierSpendPool) {
      const result = await this.createFreeTierTransaction(transaction);
      if (result.isErr()) {
        return err(result.error);
      }
    } else {
      const result = await this.createPaidTransaction(transaction);
      if (result.isErr()) {
        return err(result.error);
      }
    }
    return ok(undefined);
  }

  async getOrNoneFreeTierSpendPool(
    userId: string,
    appId: string
  ): Promise<AppResult<{ spendPool: SpendPool; effectiveBalance: number } | null, DatabaseError>> {
    try {
      const fetchSpendPoolInfo =
        await this.freeTierService.getOrNoneFreeTierSpendPool(appId, userId);
      if (fetchSpendPoolInfo) {
        this.freeTierSpendPool = fetchSpendPoolInfo.spendPool;
        return ok({
          spendPool: fetchSpendPoolInfo.spendPool,
          effectiveBalance: fetchSpendPoolInfo.effectiveBalance,
        });
      }
      return ok(null);
    } catch (error) {
      logger.error('Error fetching free tier spend pool', { error, userId, appId });
      return err(new DatabaseError('Failed to fetch free tier spend pool', 'getOrNoneFreeTierSpendPool'));
    }
  }

  async computeTransactionCosts(
    transaction: Transaction,
    referralCodeId: string | null,
    addEchoProfit: boolean = false
  ): Promise<AppResult<TransactionCosts, AuthenticationError | ValidationError>> {
    if (!this.markUpAmount) {
      logger.error('User has not authenticated');
      return err(new AuthenticationError('User has not authenticated'));
    }

    if (!this.referralAmount) {
      logger.error('Referral amount not found');
      return err(new AuthenticationError('Referral amount not found'));
    }

    const markUpDecimal = this.markUpAmount.minus(1);
    const referralDecimal = this.referralAmount.minus(1);

    if (markUpDecimal.lessThan(0.0)) {
      logger.error('App markup must be greater than 1.0');
      return err(new ValidationError('App markup must be greater than 1.0'));
    }

    if (referralDecimal.lessThan(0.0)) {
      logger.error('Referral amount must be greater than 1.0');
      return err(new ValidationError('Referral amount must be greater than 1.0'));
    }

    const totalAppProfitDecimal =
      transaction.rawTransactionCost.mul(markUpDecimal);

    const referralProfitDecimal = referralCodeId
      ? totalAppProfitDecimal.mul(referralDecimal)
      : new Decimal(0);

    const markUpProfitDecimal = totalAppProfitDecimal.minus(
      referralProfitDecimal
    );

    const echoProfitDecimal = addEchoProfit
      ? applyEchoMarkup(transaction.rawTransactionCost)
      : new Decimal(0);

    const totalTransactionCostDecimal = transaction.rawTransactionCost
      .plus(totalAppProfitDecimal)
      .plus(echoProfitDecimal);

    return ok({
      rawTransactionCost: transaction.rawTransactionCost,
      totalTransactionCost: totalTransactionCostDecimal,
      totalAppProfit: totalAppProfitDecimal,
      referralProfit: referralProfitDecimal,
      markUpProfit: markUpProfitDecimal,
      echoProfit: echoProfitDecimal,
    });
  }
  async createFreeTierTransaction(transaction: Transaction): Promise<AppResult<void, AuthenticationError | ValidationError | PaymentRequiredError | DatabaseError>> {
    if (!this.authResult) {
      logger.error('No authentication result available');
      return err(new AuthenticationError('No authentication result available'));
    }

    if (!this.freeTierSpendPool) {
      logger.error('No free tier spend pool available');
      return err(new PaymentRequiredError());
    }

    const { userId, echoAppId, apiKeyId } = this.authResult;
    if (!userId || !echoAppId) {
      logger.error('Missing required user or app information');
      return err(new AuthenticationError('Missing required user or app information'));
    }

    const costsResult = await this.computeTransactionCosts(transaction, this.referralCodeId);
    if (costsResult.isErr()) {
      return err(costsResult.error);
    }

    const {
      rawTransactionCost,
      totalTransactionCost,
      totalAppProfit,
      echoProfit,
      referralProfit,
      markUpProfit,
    } = costsResult.value;

    const transactionData: TransactionRequest = {
      totalCost: totalTransactionCost,
      appProfit: totalAppProfit,
      markUpProfit: markUpProfit,
      referralProfit: referralProfit,
      rawTransactionCost: rawTransactionCost,
      echoProfit: echoProfit,
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

    try {
      await this.freeTierService.createFreeTierTransaction(
        transactionData,
        this.freeTierSpendPool.id
      );
      return ok(undefined);
    } catch (error) {
      logger.error('Error creating free tier transaction', { error });
      return err(new DatabaseError('Failed to create free tier transaction', 'createFreeTierTransaction'));
    }
  }

  async createPaidTransaction(transaction: Transaction): Promise<AppResult<void, AuthenticationError | ValidationError | DatabaseError>> {
    if (!this.authResult) {
      logger.error('No authentication result available');
      return err(new AuthenticationError('No authentication result available'));
    }

    const costsResult = await this.computeTransactionCosts(transaction, this.referralCodeId);
    if (costsResult.isErr()) {
      return err(costsResult.error);
    }

    const {
      rawTransactionCost,
      totalTransactionCost,
      totalAppProfit,
      referralProfit,
      markUpProfit,
      echoProfit,
    } = costsResult.value;

    const { userId, echoAppId, apiKeyId } = this.authResult;

    const transactionData: TransactionRequest = {
      totalCost: totalTransactionCost,
      appProfit: totalAppProfit,
      markUpProfit: markUpProfit,
      referralProfit: referralProfit,
      rawTransactionCost: rawTransactionCost,
      echoProfit: echoProfit,
      metadata: transaction.metadata,
      status: transaction.status,
      userId: userId,
      echoAppId: echoAppId,
      ...(apiKeyId && { apiKeyId }),
      ...(this.markUpId && { markUpId: this.markUpId }),
      ...(this.referralCodeId && { referralCodeId: this.referralCodeId }),
      ...(this.referrerRewardId && { referrerRewardId: this.referrerRewardId }),
    };

    const result = await this.dbService.createPaidTransaction(transactionData);
    
    if (result.isErr()) {
      logger.error('Error creating paid transaction', { error: result.error });
      return err(result.error);
    }
    
    return ok(undefined);
  }

  async identifyX402Transaction(
    echoApp: EchoApp,
    markUp: MarkUp
  ): Promise<void> {
    this.markUpId = markUp.id;
    this.markUpAmount = markUp.amount;
    this.x402AuthenticationResult = {
      echoApp,
      echoAppId: echoApp.id,
    };
  }

  async createX402Transaction(
    transaction: Transaction,
    addEchoProfit: boolean = true
  ): Promise<AppResult<TransactionCosts, AuthenticationError | ValidationError | DatabaseError>> {
    const costsResult = await this.computeTransactionCosts(
      transaction,
      null,
      addEchoProfit
    );
    
    if (costsResult.isErr()) {
      return err(costsResult.error);
    }
    
    const transactionCosts = costsResult.value;

    const transactionData: TransactionRequest = {
      totalCost: transactionCosts.totalTransactionCost,
      appProfit: transactionCosts.totalAppProfit,
      markUpProfit: transactionCosts.markUpProfit,
      referralProfit: transactionCosts.referralProfit,
      rawTransactionCost: transactionCosts.rawTransactionCost,
      echoProfit: transactionCosts.echoProfit,
      metadata: transaction.metadata,
      status: transaction.status,
      ...(this.x402AuthenticationResult?.echoAppId && {
        echoAppId: this.x402AuthenticationResult?.echoAppId,
      }),
      ...(this.markUpId && { markUpId: this.markUpId }),
      transactionType: EnumTransactionType.X402,
    };

    const result = await this.dbService.createPaidTransaction(transactionData);
    
    if (result.isErr()) {
      logger.error('Error creating X402 transaction', { error: result.error });
      return err(result.error);
    }
    
    return ok(transactionCosts);
  }
}
