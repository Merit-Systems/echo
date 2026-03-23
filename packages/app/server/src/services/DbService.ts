import {
  Balance,
  ApiKeyValidationResult,
  EchoAccessJwtPayload,
  TransactionRequest,
  isLlmTransactionMetadata,
  isVeoTransactionMetadata,
  EchoApp,
} from '../types';
import { createHmac } from 'crypto';
import { jwtVerify } from 'jose';
import {
  PrismaClient,
  Prisma,
  Transaction,
  UserSpendPoolUsage,
  EnumTransactionType,
} from '../generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import logger from '../logger';
import { env } from '../env';
import { Result, ResultAsync, ok, err } from 'neverthrow';
import type { DbError, AuthError } from '../errors/results';

/**
 * Secret key for deterministic API key hashing (should match echo-control)
 */
const API_KEY_HASH_SECRET = env.API_KEY_HASH_SECRET;

const API_ECHO_ACCESS_JWT_SECRET = env.API_ECHO_ACCESS_JWT_SECRET;

/**
 * Hash an API key deterministically for O(1) database lookup
 */
function hashApiKey(apiKey: string): string {
  return createHmac('sha256', API_KEY_HASH_SECRET).update(apiKey).digest('hex');
}

export class EchoDbService {
  private db: PrismaClient;
  private apiJwtSecret: Uint8Array;

  constructor(db: PrismaClient) {
    this.db = db;
    this.apiJwtSecret = new TextEncoder().encode(API_ECHO_ACCESS_JWT_SECRET);
  }

  /**
   * Validate an API key and return user/app information.
   * Returns a ResultAsync with the validation result or a typed AuthError.
   * Centralized logic previously duplicated in echo-control and echo-server.
   */
  validateApiKey(apiKey: string): ResultAsync<ApiKeyValidationResult, AuthError> {
    const cleanApiKey = apiKey.replace('Bearer ', '');
    const isJWT = cleanApiKey.split('.').length === 3;

    if (isJWT) {
      return ResultAsync.fromPromise(
        jwtVerify(cleanApiKey, this.apiJwtSecret),
        (cause): AuthError => ({ type: 'AUTH_JWT_VERIFICATION_FAILED', cause })
      ).andThen((verifyResult): Result<EchoAccessJwtPayload, AuthError> => {
        const payload = verifyResult.payload as unknown as EchoAccessJwtPayload;

        if (!payload) {
          return err({ type: 'AUTH_INVALID_API_KEY' });
        }

        if (!payload.user_id || !payload.app_id) {
          logger.error(
            `JWT missing required fields: user_id=${payload.user_id}, app_id=${payload.app_id}`
          );
          return err({
            type: 'AUTH_MISSING_FIELDS',
            fields: [
              ...(!payload.user_id ? ['user_id'] : []),
              ...(!payload.app_id ? ['app_id'] : []),
            ],
          });
        }

        if (payload.exp && payload.exp < Date.now() / 1000) {
          return err({ type: 'AUTH_EXPIRED_JWT' });
        }

        return ok(payload);
      }).andThen((payload: EchoAccessJwtPayload) =>
        ResultAsync.fromPromise(
          Promise.all([
            this.db.user.findUnique({
              where: { id: payload.user_id },
              select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                totalPaid: true,
                totalSpent: true,
              },
            }),
            this.db.echoApp.findUnique({
              where: { id: payload.app_id },
              select: {
                id: true,
                name: true,
                description: true,
                isArchived: true,
                createdAt: true,
                updatedAt: true,
              },
            }),
          ]),
          (cause): AuthError => ({ type: 'AUTH_JWT_VERIFICATION_FAILED', cause })
        ).andThen(([user, app]: [any, any]): Result<ApiKeyValidationResult, AuthError> => {
          if (!user || !app) {
            return err({ type: 'AUTH_INVALID_API_KEY' });
          }

          return ok({
            userId: payload.user_id,
            echoAppId: payload.app_id,
            user: {
              id: user.id,
              email: user.email,
              ...(user.name && { name: user.name }),
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
            echoApp: {
              id: app.id,
              name: app.name,
              ...(app.description && { description: app.description }),
              createdAt: app.createdAt.toISOString(),
              updatedAt: app.updatedAt.toISOString(),
            },
          });
        })
      );
    }

    // Hash the provided API key for direct O(1) lookup
    const keyHash = hashApiKey(cleanApiKey);

    return ResultAsync.fromPromise(
      this.db.apiKey.findUnique({
        where: { keyHash },
        include: {
          user: true,
          echoApp: true,
        },
      }),
      (cause): AuthError => ({ type: 'AUTH_JWT_VERIFICATION_FAILED', cause })
    ).andThen((apiKeyRecord: any): Result<ApiKeyValidationResult, AuthError> => {
      // Verify the API key is valid and all related entities are active
      if (
        !apiKeyRecord ||
        apiKeyRecord.isArchived ||
        apiKeyRecord.user.isArchived ||
        apiKeyRecord.echoApp.isArchived
      ) {
        return err({ type: 'AUTH_INVALID_API_KEY' });
      }

      return ok({
        userId: apiKeyRecord.userId,
        echoAppId: apiKeyRecord.echoAppId,
        user: {
          id: apiKeyRecord.user.id,
          email: apiKeyRecord.user.email,
          ...(apiKeyRecord.user.name && { name: apiKeyRecord.user.name }),
          createdAt: apiKeyRecord.user.createdAt.toISOString(),
          updatedAt: apiKeyRecord.user.updatedAt.toISOString(),
        },
        echoApp: {
          id: apiKeyRecord.echoApp.id,
          name: apiKeyRecord.echoApp.name,
          ...(apiKeyRecord.echoApp.description && {
            description: apiKeyRecord.echoApp.description,
          }),
          createdAt: apiKeyRecord.echoApp.createdAt.toISOString(),
          updatedAt: apiKeyRecord.echoApp.updatedAt.toISOString(),
        },
        apiKeyId: apiKeyRecord.id,
      });
    });
  }

  async getReferralCodeForUser(
    userId: string,
    echoAppId: string
  ): Promise<string | null> {
    const appMembership = await this.db.appMembership.findUnique({
      where: {
        userId_echoAppId: {
          userId,
          echoAppId,
        },
      },
      select: {
        referrerId: true,
      },
    });

    if (!appMembership) {
      return null;
    }

    return appMembership.referrerId;
  }

  /**
   * Calculate total balance for a user across all apps.
   * Returns a ResultAsync with the Balance or a typed DbError.
   * Uses User.totalPaid and User.totalSpent for consistent balance calculation.
   */
  getBalance(userId: string): ResultAsync<Balance, DbError> {
    return ResultAsync.fromPromise(
      this.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          totalPaid: true,
          totalSpent: true,
        },
      }),
      (cause): DbError => ({ type: 'DB_QUERY_FAILED', cause })
    ).andThen((user: any): Result<Balance, DbError> => {
      if (!user) {
        logger.error(`User not found: ${userId}`);
        return err({ type: 'DB_NOT_FOUND', entity: 'User', id: userId });
      }

      const totalPaid = Number(user.totalPaid);
      const totalSpent = Number(user.totalSpent);
      const balance = totalPaid - totalSpent;

      return ok({ balance, totalPaid, totalSpent });
    });
  }

  /**
   * Update API key's last used timestamp
   * @param tx - Prisma transaction client
   * @param apiKeyId - The API key ID to update
   */
  private async updateApiKeyLastUsed(
    tx: Prisma.TransactionClient,
    apiKeyId: string
  ): Promise<void> {
    await tx.apiKey.update({
      where: { id: apiKeyId },
      data: { lastUsed: new Date().toISOString() },
    });
  }

  /**
   * Update user's total spent amount
   * @param tx - Prisma transaction client
   * @param userId - The user ID to update
   * @param amount - The amount to increment totalSpent by
   */
  private async updateUserTotalSpent(
    tx: Prisma.TransactionClient,
    userId: string,
    amount: Decimal
  ): Promise<void> {
    await tx.user.update({
      where: { id: userId },
      data: {
        totalSpent: {
          increment: amount,
        },
      },
    });
  }

  /**
   * Create a new transaction record
   * @param tx - Prisma transaction client
   * @param transaction - The transaction data to create
   */
  private async createTransactionRecord(
    tx: Prisma.TransactionClient,
    transaction: TransactionRequest
  ): Promise<Transaction> {
    // First create the transaction metadata record
    const transactionMetadata = await tx.transactionMetadata.create({
      data: {
        providerId: transaction.metadata.providerId,
        provider: transaction.metadata.provider,
        model: transaction.metadata.model,
        // LLM-specific fields
        inputTokens: isLlmTransactionMetadata(transaction.metadata)
          ? transaction.metadata.inputTokens
          : null,
        outputTokens: isLlmTransactionMetadata(transaction.metadata)
          ? transaction.metadata.outputTokens
          : null,
        totalTokens: isLlmTransactionMetadata(transaction.metadata)
          ? transaction.metadata.totalTokens
          : null,
        prompt: isLlmTransactionMetadata(transaction.metadata)
          ? transaction.metadata.prompt || null
          : null,
        // Veo-specific fields
        durationSeconds: isVeoTransactionMetadata(transaction.metadata)
          ? transaction.metadata.durationSeconds
          : null,
        generateAudio: isVeoTransactionMetadata(transaction.metadata)
          ? transaction.metadata.generateAudio
          : null,
      },
    });

    // Then create the transaction record with the linked metadata ID
    return await tx.transaction.create({
      data: {
        totalCost: transaction.totalCost,
        appProfit: transaction.appProfit,
        markUpProfit: transaction.markUpProfit,
        referralProfit: transaction.referralProfit,
        rawTransactionCost: transaction.rawTransactionCost,
        echoProfit: transaction.echoProfit,
        transactionType:
          transaction.transactionType ?? EnumTransactionType.BALANCE,
        status: transaction.status ?? null,
        userId: transaction.userId ?? null,
        echoAppId: transaction.echoAppId ?? null,
        apiKeyId: transaction.apiKeyId || null,
        markUpId: transaction.markUpId || null,
        spendPoolId: transaction.spendPoolId || null,
        transactionMetadataId: transactionMetadata.id,
        referralCodeId: transaction.referralCodeId || null,
        referrerRewardId: transaction.referrerRewardId || null,
      },
    });
  }

  /**
   * Update spend pool's total spent amount
   * @param tx - Prisma transaction client
   * @param spendPoolId - The spend pool ID to update
   * @param amount - The amount to increment totalSpent by
   */
  private async updateSpendPoolTotalSpent(
    tx: Prisma.TransactionClient,
    spendPoolId: string,
    amount: Decimal
  ): Promise<void> {
    await tx.spendPool.update({
      where: { id: spendPoolId },
      data: {
        totalSpent: {
          increment: amount,
        },
      },
    });
  }

  /**
   * Upsert user spend pool usage record
   * @param tx - Prisma transaction client
   * @param userId - The user ID
   * @param spendPoolId - The spend pool ID
   * @param amount - The amount to add to totalSpent
   */
  private async upsertUserSpendPoolUsage(
    tx: Prisma.TransactionClient,
    userId: string,
    spendPoolId: string,
    amount: Decimal
  ): Promise<UserSpendPoolUsage> {
    return await tx.userSpendPoolUsage.upsert({
      where: {
        userId_spendPoolId: {
          userId,
          spendPoolId,
        },
      },
      create: {
        userId,
        spendPoolId,
        totalSpent: amount,
      },
      update: {
        totalSpent: {
          increment: amount,
        },
      },
    });
  }

  /**
   * Create an LLM transaction record and atomically update user's totalSpent.
   * Returns a ResultAsync with the created Transaction or a typed DbError.
   * Centralized logic for transaction creation with atomic balance updates.
   */
  createPaidTransaction(
    transaction: TransactionRequest
  ): ResultAsync<Transaction, DbError> {
    return ResultAsync.fromPromise<Transaction, DbError>(
      this.db.$transaction(async (tx: Prisma.TransactionClient) => {
        // Create the LLM transaction record
        const dbTransaction = await this.createTransactionRecord(tx, transaction);

        if (transaction.userId) {
          // Update user's total spent amount
          await this.updateUserTotalSpent(tx, transaction.userId, transaction.totalCost);
        }
        // Update API key's last used timestamp if provided
        if (transaction.apiKeyId) {
          await this.updateApiKeyLastUsed(tx, transaction.apiKeyId);
        }

        return dbTransaction;
      }),
      (cause): DbError => ({ type: 'DB_TRANSACTION_FAILED', cause })
    ).map((result: Transaction) => {
      logger.info(
        `Created transaction for model ${transaction.metadata.model}: $${transaction.totalCost}, updated user totalSpent`,
        result.id
      );
      return result;
    });
  }

  /**
   * Create a free tier transaction and update all related records atomically.
   * Returns a ResultAsync with the transaction and usage records or a typed DbError.
   * @param transactionData - The transaction data to create
   * @param spendPoolId - The spend pool ID
   */
  createFreeTierTransaction(
    transactionData: TransactionRequest,
    spendPoolId: string
  ): ResultAsync<{ transaction: Transaction; userSpendPoolUsage: UserSpendPoolUsage | null }, DbError> {
    return ResultAsync.fromPromise<{ transaction: Transaction; userSpendPoolUsage: UserSpendPoolUsage | null }, DbError>(
      this.db.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Verify the spend pool exists
        const spendPool = await tx.spendPool.findUnique({
          where: { id: spendPoolId },
          select: { perUserSpendLimit: true },
        });

        if (!spendPool) {
          throw new Error('Spend pool not found');
        }
        // 2. Upsert UserSpendPoolUsage record using helper
        const userSpendPoolUsage = transactionData.userId
          ? await this.upsertUserSpendPoolUsage(
              tx,
              transactionData.userId,
              spendPoolId,
              transactionData.totalCost
            )
          : null;
        // 3. Create the transaction record
        const transaction = await this.createTransactionRecord(tx, transactionData);

        // 4. Update API key lastUsed if apiKeyId is provided
        if (transactionData.apiKeyId) {
          await this.updateApiKeyLastUsed(tx, transactionData.apiKeyId);
        }

        // 5. Update totalSpent on the SpendPool using helper
        await this.updateSpendPoolTotalSpent(tx, spendPoolId, transactionData.totalCost);

        logger.info(
          `Created free tier transaction for model ${transactionData.metadata.model}: $${transactionData.totalCost}`,
          transaction.id
        );

        return { transaction, userSpendPoolUsage };
      }),
      (cause): DbError => ({ type: 'DB_TRANSACTION_FAILED', cause })
    );
  }

  async confirmAccessControl(
    userId: string,
    providerId: string
  ): Promise<boolean> {
    const transaction: Transaction | null = await this.db.transaction.findFirst(
      {
        where: {
          userId,
          transactionMetadata: {
            providerId,
          },
        },
      }
    );

    return !!transaction;
  }

  async getEchoAppById(echoAppId: string): Promise<EchoApp | null> {
    const echoApp = await this.db.echoApp.findUnique({
      where: { id: echoAppId },
    });
    if (!echoApp) {
      return null;
    }
    return {
      id: echoApp.id,
      name: echoApp.name,
      createdAt: echoApp.createdAt.toISOString(),
      updatedAt: echoApp.updatedAt.toISOString(),
    };
  }
  async getCurrentMarkupByEchoAppId(echoAppId: string) {
    const echoApp = await this.getEchoAppById(echoAppId);
    if (!echoApp) {
      return null;
    }
    const markup = await this.db.echoApp.findUnique({
      where: { id: echoAppId },
      select: { markUp: true },
    });
    return markup?.markUp || null;
  }
}
