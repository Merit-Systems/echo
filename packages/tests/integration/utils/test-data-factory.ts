import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { hashApiKey } from '../../../app/control/src/lib/crypto.js';

const prisma = new PrismaClient();

export interface CreateUserOptions {
  id?: string;
  email?: string;
  name?: string;
}

export interface CreateEchoAppOptions {
  id?: string;
  name?: string;
  description?: string;
  userId: string;
  authorizedCallbackUrls?: string[];
  isActive?: boolean;
}

export interface CreateApiKeyOptions {
  id?: string;
  keyHash?: string;
  name?: string;
  userId: string;
  echoAppId: string;
  isActive?: boolean;
}

export interface CreatePaymentOptions {
  id?: string;
  paymentId?: string;
  amount: number;
  currency?: string;
  status?: string;
  description?: string;
  userId: string;
  echoAppId?: string;
}

export interface CreateLlmTransactionOptions {
  id?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  totalCost?: number;
  prompt?: string;
  response?: string;
  status?: string;
  userId: string;
  echoAppId: string;
  apiKeyId: string;
}

export class TestDataFactory {
  private static instance: TestDataFactory;

  static getInstance(): TestDataFactory {
    if (!TestDataFactory.instance) {
      TestDataFactory.instance = new TestDataFactory();
    }
    return TestDataFactory.instance;
  }

  // Generate unique test data
  generateUniqueId(): string {
    return crypto.randomUUID();
  }

  generateUniqueEmail(): string {
    return `test-${crypto.randomBytes(8).toString('hex')}@example.com`;
  }

  generateApiKey(): string {
    return `ek_test_${crypto.randomBytes(16).toString('hex')}`;
  }

  generatePaymentId(): string {
    return `pi_test_${crypto.randomBytes(12).toString('hex')}`;
  }

  // Create test entities
  async createUser(options: CreateUserOptions = {}): Promise<any> {
    return prisma.user.create({
      data: {
        id: options.id || this.generateUniqueId(),
        email: options.email || this.generateUniqueEmail(),
        name: options.name || 'Test User',
      },
    });
  }

  async createEchoApp(options: CreateEchoAppOptions): Promise<any> {
    return prisma.echoApp.create({
      data: {
        id: options.id || this.generateUniqueId(),
        name: options.name || 'Test Echo App',
        description: options.description || 'A test Echo application',
        userId: options.userId,
        authorizedCallbackUrls: options.authorizedCallbackUrls || [
          'http://localhost:3000/callback',
          'http://localhost:3001/callback',
        ],
        isActive: options.isActive ?? true,
      },
    });
  }

  async createApiKey(options: CreateApiKeyOptions): Promise<any> {
    return prisma.apiKey.create({
      data: {
        id: options.id || this.generateUniqueId(),
        keyHash: options.keyHash || hashApiKey(this.generateApiKey()),
        name: options.name || 'Test API Key',
        userId: options.userId,
        echoAppId: options.echoAppId,
        isActive: options.isActive ?? true,
      },
    });
  }

  async createPayment(options: CreatePaymentOptions): Promise<any> {
    return prisma.payment.create({
      data: {
        id: options.id || this.generateUniqueId(),
        paymentId: options.paymentId || this.generatePaymentId(),
        amount: options.amount,
        currency: options.currency || 'usd',
        status: options.status || 'succeeded',
        description: options.description || 'Test payment',
        userId: options.userId,
        echoAppId: options.echoAppId,
      },
    });
  }

  async createLlmTransaction(
    options: CreateLlmTransactionOptions
  ): Promise<any> {
    const inputTokens = options.inputTokens || 100;
    const outputTokens = options.outputTokens || 50;

    return prisma.llmTransaction.create({
      data: {
        id: options.id || this.generateUniqueId(),
        model: options.model || 'claude-3-5-sonnet-20241022',
        inputTokens,
        outputTokens,
        totalTokens: options.totalTokens || inputTokens + outputTokens,
        totalCost: options.totalCost || (inputTokens + outputTokens) * 0.001,
        prompt: options.prompt || 'Test prompt for integration testing',
        response: options.response || 'Test response from integration testing',
        status: options.status || 'completed',
        userId: options.userId,
        echoAppId: options.echoAppId,
        apiKeyId: options.apiKeyId,
      },
    });
  }

  async createRefreshToken(options: {
    token?: string;
    userId: string;
    echoAppId: string;
    apiKeyId: string;
    expiresAt?: Date;
    scope?: string;
  }): Promise<any> {
    const expiresAt =
      options.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return prisma.refreshToken.create({
      data: {
        id: this.generateUniqueId(),
        token: options.token || `rt_${crypto.randomBytes(32).toString('hex')}`,
        userId: options.userId,
        echoAppId: options.echoAppId,
        apiKeyId: options.apiKeyId,
        expiresAt,
        scope: options.scope || 'llm:invoke offline_access',
        isActive: true,
      },
    });
  }

  // Create complete test scenarios
  async createUserWithApp(userOptions: CreateUserOptions = {}): Promise<{
    user: any;
    echoApp: any;
  }> {
    const user = await this.createUser(userOptions);
    const echoApp = await this.createEchoApp({
      userId: user.id,
      name: `${user.name}'s App`,
    });

    return { user, echoApp };
  }

  async createFullTestScenario(userOptions: CreateUserOptions = {}): Promise<{
    user: any;
    echoApp: any;
    apiKey: any;
    payment: any;
    llmTransaction: any;
  }> {
    const { user, echoApp } = await this.createUserWithApp(userOptions);

    const apiKey = await this.createApiKey({
      userId: user.id,
      echoAppId: echoApp.id,
    });

    const payment = await this.createPayment({
      userId: user.id,
      echoAppId: echoApp.id,
      amount: 1000, // $10.00
    });

    const llmTransaction = await this.createLlmTransaction({
      userId: user.id,
      echoAppId: echoApp.id,
      apiKeyId: apiKey.id,
    });

    return {
      user,
      echoApp,
      apiKey,
      payment,
      llmTransaction,
    };
  }

  // Cleanup utilities
  async cleanupUser(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
    await prisma.llmTransaction.deleteMany({ where: { userId } });
    await prisma.payment.deleteMany({ where: { userId } });
    await prisma.apiKey.deleteMany({ where: { userId } });
    await prisma.echoApp.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  }

  async cleanupEchoApp(echoAppId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { echoAppId } });
    await prisma.llmTransaction.deleteMany({ where: { echoAppId } });
    await prisma.payment.deleteMany({ where: { echoAppId } });
    await prisma.apiKey.deleteMany({ where: { echoAppId } });
    await prisma.echoApp.delete({ where: { id: echoAppId } });
  }

  async cleanupTestData(): Promise<void> {
    // Clean all test data (be careful with this!)
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            contains: 'test',
          },
        },
      },
    });

    await prisma.llmTransaction.deleteMany({
      where: {
        user: {
          email: {
            contains: 'test',
          },
        },
      },
    });

    await prisma.payment.deleteMany({
      where: {
        user: {
          email: {
            contains: 'test',
          },
        },
      },
    });

    await prisma.apiKey.deleteMany({
      where: {
        user: {
          email: {
            contains: 'test',
          },
        },
      },
    });

    await prisma.echoApp.deleteMany({
      where: {
        user: {
          email: {
            contains: 'test',
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

// Export singleton instance
export const testDataFactory = TestDataFactory.getInstance();
