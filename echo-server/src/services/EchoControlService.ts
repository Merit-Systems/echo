import type {
  ApiKeyValidationResult,
  EchoApp,
  User,
  CreateLlmTransactionRequest,
} from '@zdql/echo-typescript-sdk/src/types';
import { EchoDbService } from './DbService';
import { existsSync } from 'fs';
import { join } from 'path';

import { PrismaClient, UsageProduct } from '../generated/prisma';

export class EchoControlService {
  private readonly db: PrismaClient;
  private readonly dbService: EchoDbService;
  private readonly apiKey: string;
  private authResult: ApiKeyValidationResult | null = null;
  private appMarkup: number | null = null;

  constructor(apiKey: string) {
    // Check if the generated Prisma client exists
    const generatedPrismaPath = join(__dirname, '..', 'generated', 'prisma');
    if (!existsSync(generatedPrismaPath)) {
      throw new Error(
        `Generated Prisma client not found at ${generatedPrismaPath}. ` +
          'Please run "npm run copy-prisma" to copy the generated client from echo-control.'
      );
    }

    this.apiKey = apiKey;
    this.db = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL ?? 'postgresql://localhost:5469/echo',
        },
      },
    });
    this.dbService = new EchoDbService(this.db);
  }

  /**
   * Verify API key against the database and cache the authentication result
   * Uses centralized logic from EchoDbService
   */
  async verifyApiKey(): Promise<ApiKeyValidationResult | null> {
    try {
      this.authResult = await this.dbService.validateApiKey(this.apiKey);
    } catch (error) {
      console.error('Error verifying API key:', error);
      return null;
    }
    this.appMarkup = await this.getAppMarkup();
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
   * Get the database instance for use by providers
   */
  getDb(): PrismaClient {
    return this.db;
  }

  /**
   * Get balance for the authenticated user directly from the database
   * Uses centralized logic from EchoDbService
   */
  async getBalance(): Promise<number> {
    try {
      if (!this.authResult) {
        console.error('No authentication result available');
        return 0;
      }

      const { userId } = this.authResult;
      const balance = await this.dbService.getBalance(userId);

      console.log('fetched balance', balance);
      return balance.balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  async getAppMarkup(): Promise<number> {
    if (!this.authResult) {
      console.error('No authentication result available');
      return 1.0;
    }

    const appWithMarkup = await this.db.echoApp.findUnique({
      where: {
        id: this.getEchoAppId() ?? '',
      },
      include: {
        currentMarkup: true,
      },
    });

    if (!appWithMarkup) {
      throw new Error('EchoApp not found');
    }

    // If no current markup is set, default to 1.0 (no markup)
    if (!appWithMarkup.currentMarkup) {
      return 1.0;
    }

    const markupRate = Number(appWithMarkup.currentMarkup.rate);

    if (markupRate < 1.0) {
      throw new Error('App markup must be greater than or equal to 1.0');
    }

    return markupRate;
  }

  /**
   * Create an LLM transaction record directly in the database
   * Uses centralized logic from EchoDbService
   */
  async createTransaction(
    transaction: CreateLlmTransactionRequest,
    usageProduct?: UsageProduct
  ): Promise<void> {
    try {
      if (!this.authResult) {
        console.error('No authentication result available');
        return;
      }

      if (!this.appMarkup) {
        console.error('User has not authenticated');
        return;
      }

      // Get the current markup configuration for the app
      const appWithMarkup = await this.db.echoApp.findUnique({
        where: {
          id: this.getEchoAppId() ?? '',
        },
        include: {
          currentMarkup: true,
        },
      });

      const { userId, echoAppId, apiKeyId } = this.authResult;
      await this.dbService.createLlmTransaction(
        userId,
        echoAppId,
        transaction,
        apiKeyId,
        usageProduct,
        this.appMarkup,
        appWithMarkup?.currentMarkup || null
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
}
