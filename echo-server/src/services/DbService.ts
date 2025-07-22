import {
  Balance,
  ApiKeyValidationResult,
  EchoAccessJwtPayload,
} from '@zdql/echo-typescript-sdk/src/types';
import { createHmac } from 'crypto';
import { jwtVerify } from 'jose';
import { PrismaClient } from 'generated/prisma';
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
  private db: PrismaClient;
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

      // Verify the API key is valid and all related entities are not archived
      if (
        !apiKeyRecord ||
        apiKeyRecord.isArchived ||
        apiKeyRecord.user.isArchived ||
        apiKeyRecord.echoApp.isArchived
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
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return null;
    }
  }

  /**
   * Calculate total balance for a user using credit grants system
   * Uses credit grants (credits - debits) for accurate balance calculation
   * Uses efficient database-level aggregation with expiration filtering
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

      const now = new Date();

      // Run all aggregation queries in parallel for efficiency
      const [totalCreditsResult, activeCreditsResult, totalDebitsResult] =
        await Promise.all([
          // Get total credits (all credits regardless of expiration)
          this.db.creditGrant.aggregate({
            where: {
              userId,
              isArchived: false,
              type: 'credit',
            },
            _sum: {
              amount: true,
            },
          }),

          // Get active credits (non-expired credits) - used for balance calculation
          this.db.creditGrant.aggregate({
            where: {
              userId,
              isArchived: false,
              type: 'credit',
              OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
            _sum: {
              amount: true,
            },
          }),

          // Get total debits
          this.db.creditGrant.aggregate({
            where: {
              userId,
              isArchived: false,
              type: 'debit',
            },
            _sum: {
              amount: true,
            },
          }),
        ]);

      const totalCredits = Number(totalCreditsResult._sum.amount || 0);
      const activeCredits = Number(activeCreditsResult._sum.amount || 0);
      const totalDebits = Number(totalDebitsResult._sum.amount || 0);

      // Balance = Active Credits - Total Debits (excludes expired credits)
      const balance = activeCredits - totalDebits;

      return {
        balance,
        totalPaid: totalCredits, // Use total credits for totalPaid (includes expired)
        totalSpent: totalDebits,
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
   * Create an LLM transaction record and create corresponding debit credit grant
   * Centralized logic for transaction creation with credit grant-based balance tracking
   *
   * Now expects UsageProducts to be pre-seeded. Run 'pnpm run seed-usage-products' to populate them.
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
    apiKeyId?: string,
    usageProduct?: any,
    markupRate?: number,
    markupConfig?: any
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

      // Calculate costs - transaction stores raw cost, credit grant and revenue use markup
      const rawCost = transaction.cost;
      const finalMarkupRate = markupRate || 1.0;
      const totalCost = rawCost * finalMarkupRate;
      const markupAmount = totalCost - rawCost;

      // Use a database transaction to atomically create the LLM transaction and debit credit grant
      const result = await this.db.$transaction(async tx => {
        let finalUsageProduct = usageProduct;

        // If no usageProduct provided, find it in the database
        if (!finalUsageProduct) {
          finalUsageProduct = await tx.usageProduct.findFirst({
            where: {
              model: transaction.model,
              echoAppId: echoAppId,
              isArchived: false,
            },
          });

          if (!finalUsageProduct) {
            throw new Error(
              `UsageProduct not found for model '${transaction.model}' in app '${echoAppId}'`
            );
          }
        }

        // Create the LLM transaction with raw cost (without markup)
        const dbTransaction = await tx.transaction.create({
          data: {
            model: transaction.model,
            inputTokens: transaction.inputTokens,
            providerId: transaction.providerId,
            outputTokens: transaction.outputTokens,
            totalTokens: transaction.totalTokens,
            cost: rawCost, // Store raw cost without markup
            prompt: transaction.prompt || null,
            response: transaction.response || null,
            status: transaction.status || 'success',
            errorMessage: transaction.errorMessage || null,
            userId: userId,
            echoAppId: echoAppId,
            apiKeyId: apiKeyId || null,
            usageProductId: finalUsageProduct.id,
          },
        });

        // Create debit credit grant for the total cost (raw cost * markup) and link to markup
        const debitCreditGrant = await tx.creditGrant.create({
          data: {
            type: 'debit',
            amount: totalCost, // Total cost with markup applied
            source: 'transaction',
            description: `LLM usage: ${transaction.model}`,
            userId: userId,
            transactionId: dbTransaction.id,
            markupId: markupConfig?.id || null, // Link to markup configuration
          },
        });

        // Create revenue record for the app - only the markup amount
        if (markupAmount > 0) {
          await tx.revenue.create({
            data: {
              rawCost: rawCost,
              markupRate: finalMarkupRate,
              markupAmount: markupAmount,
              amount: markupAmount, // Revenue is only the markup amount
              type: 'transaction_fee',
              description: `Markup revenue from LLM usage: ${transaction.model}`,
              userId: userId,
              echoAppId: echoAppId,
              markupId: markupConfig?.id || null, // Link to markup configuration
              creditGrantId: debitCreditGrant.id,
              transactionId: dbTransaction.id,
            },
          });
        }

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
        `Created transaction for model ${transaction.model}: raw cost $${rawCost}, total cost with markup $${totalCost}, markup amount $${markupAmount}`,
        result.id
      );
      return result.id;
    } catch (error) {
      console.error('Error creating transaction and credit grant:', error);

      // Re-throw with more helpful messaging for missing UsageProducts
      if (
        error instanceof Error &&
        error.message.includes('UsageProduct not found')
      ) {
        throw error; // Already has helpful message
      }

      return null;
    }
  }
}
