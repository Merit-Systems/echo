import { PrismaClient } from '../../echo-control/src/generated/prisma/index.js';
import { TEST_CONFIG, TEST_DATA } from '../config/index.js';

// Local implementation of credit grant functions for integration tests
interface CreateCreditGrantRequest {
  type: 'credit' | 'debit';
  amount: number;
  source:
    | 'payment'
    | 'promotion'
    | 'refund'
    | 'adjustment'
    | 'transaction'
    | 'admin_grant';
  description?: string;
  expiresAt?: Date;
  paymentId?: string;
  transactionId?: string;
}

async function createCreditGrant(
  prisma: PrismaClient,
  userId: string,
  request: CreateCreditGrantRequest
) {
  const {
    type,
    amount,
    source,
    description,
    expiresAt,
    paymentId,
    transactionId,
  } = request;

  if (!amount || amount <= 0) {
    throw new Error('Valid amount is required');
  }

  return prisma.creditGrant.create({
    data: {
      type,
      amount,
      source,
      description: description || null,
      expiresAt: expiresAt || null,
      userId,
      paymentId: paymentId || null,
      transactionId: transactionId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

async function createCreditGrantFromPayment(
  prisma: PrismaClient,
  payment: any,
  description?: string
) {
  return createCreditGrant(prisma, payment.userId, {
    type: 'credit',
    amount: Number(payment.amount),
    source: 'payment',
    description: description || payment.description || 'Credit from payment',
    paymentId: payment.id,
  });
}

async function createDebitGrantFromTransaction(
  prisma: PrismaClient,
  transaction: any,
  userId: string,
  description?: string
) {
  return createCreditGrant(prisma, userId, {
    type: 'debit',
    amount: Number(transaction.cost),
    source: 'transaction',
    description: description || `LLM usage: ${transaction.model}`,
    transactionId: transaction.id,
  });
}

export async function seedIntegrationDatabase() {
  console.log(
    '🔗 Using integration test database URL:',
    TEST_CONFIG.database.url
  );

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: TEST_CONFIG.database.url,
      },
    },
  });
  console.log('🌱 Seeding integration test database...');

  try {
    // Clean existing data in reverse dependency order
    await prisma.refreshToken.deleteMany();
    await prisma.revenue.deleteMany();
    await prisma.creditGrant.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.usageProduct.deleteMany();
    await prisma.appMembership.deleteMany();
    await prisma.echoApp.deleteMany();
    await prisma.user.deleteMany();

    console.log('🧹 Cleaned existing data');

    // Create test users
    const testUser = await prisma.user.create({
      data: TEST_DATA.users.primary,
    });

    console.log('👤 Created test user:', testUser.email);

    // Create test Echo apps (OAuth clients)
    const testApp = await prisma.echoApp.create({
      data: {
        ...TEST_DATA.echoApps.primary,
        authorizedCallbackUrls: TEST_DATA.oauth.defaultCallbackUrls,
      },
    });

    // Create app membership for the test user as owner
    await prisma.appMembership.create({
      data: {
        userId: testUser.id,
        echoAppId: testApp.id,
        role: 'owner',
        status: 'active',
      },
    });

    console.log('📱 Created test Echo app:', testApp.name);

    // Create test API keys
    const testApiKey = await prisma.apiKey.create({
      data: {
        ...TEST_DATA.apiKeys.primary,
        userId: testUser.id,
        echoAppId: testApp.id,
      },
    });

    console.log('🔑 Created test API key:', testApiKey.name);

    // Create a second user for multi-user testing
    const secondUser = await prisma.user.create({
      data: TEST_DATA.users.secondary,
    });

    console.log('👤 Created second test user:', secondUser.email);

    // Create a second test app for the second user
    const secondApp = await prisma.echoApp.create({
      data: {
        ...TEST_DATA.echoApps.secondary,
        authorizedCallbackUrls: TEST_DATA.oauth.secondaryCallbackUrls,
      },
    });

    // Create app membership for the second user as owner
    await prisma.appMembership.create({
      data: {
        userId: secondUser.id,
        echoAppId: secondApp.id,
        role: 'owner',
        status: 'active',
      },
    });

    console.log('📱 Created second test Echo app:', secondApp.name);

    // Create test payment
    const testPayment = await prisma.payment.create({
      data: {
        ...TEST_DATA.payments.testPayment,
        userId: testUser.id,
      },
    });

    console.log('💳 Created test payment');

    // Create credit grant from payment using the local credit grants system
    await createCreditGrantFromPayment(
      prisma,
      testPayment,
      'Initial credit from test payment'
    );

    console.log('💰 Created credit grant from payment');

    // Create usage products for transactions
    await prisma.usageProduct.create({
      data: {
        ...TEST_DATA.transactions.usageProduct,
        echoAppId: testApp.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.usageProduct.create({
      data: {
        ...TEST_DATA.transactions.gptUsageProduct,
        echoAppId: testApp.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('📊 Created usage products for Claude and GPT models');

    // Create test LLM transaction (Claude)
    const testTransaction = await prisma.transaction.create({
      data: {
        ...TEST_DATA.transactions.testTransaction,
        providerId: 'anthropic',
        userId: testUser.id,
        echoAppId: testApp.id,
        apiKeyId: testApiKey.id,
        usageProductId: TEST_DATA.transactions.usageProduct.id,
      },
    });

    // Create test GPT transaction
    const gptTransaction = await prisma.transaction.create({
      data: {
        ...TEST_DATA.transactions.gptTransaction,
        providerId: 'openai',
        userId: testUser.id,
        echoAppId: testApp.id,
        apiKeyId: testApiKey.id,
        usageProductId: TEST_DATA.transactions.gptUsageProduct.id,
      },
    });

    console.log('🤖 Created test LLM transactions');

    // Create debit grants from transactions using the local credit grants system
    await createDebitGrantFromTransaction(
      prisma,
      testTransaction,
      testUser.id,
      'Test Claude usage debit'
    );

    await createDebitGrantFromTransaction(
      prisma,
      gptTransaction,
      testUser.id,
      'Test GPT usage debit'
    );

    console.log('💸 Created debit grants from transactions');

    console.log('✅ Integration test database seeded successfully');
    console.log('\n📊 Summary:');
    console.log(`  - Users: 2`);
    console.log(`  - Echo Apps: 2`);
    console.log(`  - API Keys: 1`);
    console.log(`  - Payments: 1`);
    console.log(`  - Usage Products: 2 (Claude, GPT)`);
    console.log(`  - Credit Grants: 3 (1 credit, 2 debits)`);
    console.log(`  - LLM Transactions: 2 (Claude, GPT)`);
  } catch (error) {
    console.error('❌ Error seeding integration test database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Re-export test data for backward compatibility
export { TEST_DATA } from '../config/index.js';

// Auto-run when called directly
if (typeof require !== 'undefined' && require.main === module) {
  seedIntegrationDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
