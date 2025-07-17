import {
  Balance,
  ApiKeyValidationResult,
  EchoAccessJwtPayload,
} from '../types';
import { createHmac } from 'crypto';
import { jwtVerify } from 'jose';
import { EchoApp, PrismaClient } from 'generated/prisma';
/**
 * Secret key for deterministic API key hashing (should match echo-control)
 */
const API_KEY_HASH_SECRET =
  process.env.API_KEY_HASH_SECRET ||
  'change-this-in-production-very-secret-key';

const API_ECHO_ACCESS_JWT_SECRET =
  process.env.API_ECHO_ACCESS_JWT_SECRET ||
  'api-jwt-secret-change-in-production';

/**
 * Hash an API key deterministically for O(1) database lookup
 */
function hashApiKey(apiKey: string): string {
  return createHmac('sha256', API_KEY_HASH_SECRET).update(apiKey).digest('hex');
}

export class EchoDbService {
  db: PrismaClient;
  private apiJwtSecret: Uint8Array;

  constructor(db: PrismaClient) {
    this.db = db;
    this.apiJwtSecret = new TextEncoder().encode(API_ECHO_ACCESS_JWT_SECRET);
  }

  /**
   * Validate an API key and return user/app information
   * Centralized logic previously duplicated in echo-control and echo-server
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult | null> {
    try {
      // Remove Bearer prefix if present
      const cleanApiKey = apiKey.replace('Bearer ', '');

      const isJWT = cleanApiKey.split('.').length === 3;

      if (isJWT) {
        const verifyResult = await jwtVerify(cleanApiKey, this.apiJwtSecret);
        const payload = verifyResult.payload as unknown as EchoAccessJwtPayload;

        if (!payload) {
          return null;
        }

        // Validate required fields exist
        if (!payload.user_id || !payload.app_id) {
          console.error('JWT missing required fields:', {
            user_id: payload.user_id,
            app_id: payload.app_id,
          });
          return null;
        }

        if (payload.exp && payload.exp < Date.now() / 1000) {
          return null;
        }

        const user = await this.db.user.findUnique({
          where: {
            id: payload.user_id,
          },
          select: {
            id: true,
            email: true,
            name: true,
            clerkId: true,
            createdAt: true,
            updatedAt: true,
            totalPaid: true,
            totalSpent: true,
          },
        });

        const app = await this.db.echoApp.findUnique({
          where: {
            id: payload.app_id,
          },
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
            isArchived: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user || !app) {
          return null;
        }

        return {
          userId: payload.user_id,
          echoAppId: payload.app_id,
          user: {
            id: user.id,
            email: user.email,
            ...(user.name && { name: user.name }),
            clerkId: user.clerkId,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          },
          echoApp: {
            id: app.id,
            name: app.name,
            ...(app.description && { description: app.description }),
            isActive: app.isActive,
            createdAt: app.createdAt.toISOString(),
            updatedAt: app.updatedAt.toISOString(),
          },
        };
      }
      // Hash the provided API key for direct O(1) lookup
      const keyHash = hashApiKey(cleanApiKey);

      // Direct lookup by keyHash - O(1) operation!
      const apiKeyRecord = await this.db.apiKey.findUnique({
        where: {
          keyHash,
        },
        include: {
          user: true,
          echoApp: true,
        },
      });

      // Verify the API key is valid and all related entities are active
      if (
        !apiKeyRecord ||
        !apiKeyRecord.isActive ||
        apiKeyRecord.isArchived ||
        apiKeyRecord.user.isArchived ||
        apiKeyRecord.echoApp.isArchived ||
        !apiKeyRecord.echoApp.isActive
      ) {
        return null;
      }

      return {
        userId: apiKeyRecord.userId,
        echoAppId: apiKeyRecord.echoAppId,
        user: {
          id: apiKeyRecord.user.id,
          email: apiKeyRecord.user.email,
          ...(apiKeyRecord.user.name && { name: apiKeyRecord.user.name }),
          clerkId: apiKeyRecord.user.clerkId,
          createdAt: apiKeyRecord.user.createdAt.toISOString(),
          updatedAt: apiKeyRecord.user.updatedAt.toISOString(),
          stripeCustomerId: apiKeyRecord.user.stripeCustomerId,
        },
        echoApp: {
          id: apiKeyRecord.echoApp.id,
          name: apiKeyRecord.echoApp.name,
          ...(apiKeyRecord.echoApp.description && {
            description: apiKeyRecord.echoApp.description,
          }),
          isActive: apiKeyRecord.echoApp.isActive,
          createdAt: apiKeyRecord.echoApp.createdAt.toISOString(),
          updatedAt: apiKeyRecord.echoApp.updatedAt.toISOString(),
        },
        apiKeyId: apiKeyRecord.id,
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return null;
    }
  }

  /**
   * Calculate total balance for a user across all apps
   * Uses User.totalPaid and User.totalSpent for consistent balance calculation
   */
  async getBalance(userId: string): Promise<Balance> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          clerkId: true,
          createdAt: true,
          updatedAt: true,
          totalPaid: true,
          totalSpent: true,
        },
      });

      if (!user) {
        console.error('User not found:', userId);
        return {
          balance: 0,
          totalPaid: 0,
          totalSpent: 0,
        };
      }

      const totalPaid = Number(user.totalPaid);
      const totalSpent = Number(user.totalSpent);
      const balance = totalPaid - totalSpent;

      return {
        balance,
        totalPaid,
        totalSpent,
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      return {
        balance: 0,
        totalPaid: 0,
        totalSpent: 0,
      };
    }
  }

  /**
   * Create an LLM transaction record and atomically update user's totalSpent
   * Centralized logic for transaction creation with atomic balance updates
   */
  async createLlmTransaction(
    userId: string,
    echoAppId: string,
    transaction: {
      model: string;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      providerId: string;
      cost: number;
      prompt?: string;
      response?: string;
      status?: string;
      errorMessage?: string;
    },
    apiKeyId?: string
  ): Promise<string | null> {
    try {
      // Validate required fields
      if (
        !transaction.model ||
        typeof transaction.inputTokens !== 'number' ||
        typeof transaction.outputTokens !== 'number' ||
        typeof transaction.totalTokens !== 'number' ||
        typeof transaction.cost !== 'number' ||
        !transaction.providerId
      ) {
        throw new Error(
          'Missing required fields: model, inputTokens, outputTokens, totalTokens, cost, providerId'
        );
      }
      // Use a database transaction to atomically create the LLM transaction and update user balance
      const result = await this.db.$transaction(async tx => {
        // Create the LLM transaction
        const dbTransaction = await tx.llmTransaction.create({
          data: {
            model: transaction.model,
            inputTokens: transaction.inputTokens,
            providerId: transaction.providerId,
            outputTokens: transaction.outputTokens,
            totalTokens: transaction.totalTokens,
            cost: transaction.cost,
            prompt: transaction.prompt || null,
            response: transaction.response || null,
            status: transaction.status || 'success',
            errorMessage: transaction.errorMessage || null,
            userId: userId,
            echoAppId: echoAppId,
            apiKeyId: apiKeyId || null,
          },
        });

        // Atomically update user's totalSpent
        await tx.user.update({
          where: { id: userId },
          data: {
            totalSpent: {
              increment: transaction.cost,
            },
          },
        });

        if (apiKeyId) {
          await tx.apiKey.update({
            where: { id: apiKeyId },
            data: {
              lastUsed: new Date().toISOString(),
            },
          });
        }
        return dbTransaction;
      });

      console.log(
        `Created transaction for model ${transaction.model}: $${transaction.cost}, updated user totalSpent`,
        result.id
      );
      return result.id;
    } catch (error) {
      console.error('Error creating transaction and updating balance:', error);
      return null;
    }
  }

  async getEchoApp(appId: string): Promise<EchoApp | null> {
    const echoApp = await this.db.echoApp.findUnique({
      where: { id: appId },
    });
    return echoApp;
  }
}
