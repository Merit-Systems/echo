#!/usr/bin/env tsx

import { PrismaClient } from '../src/generated/prisma/index.js';
import modelPrices from '../model_prices.json';
import * as crypto from 'crypto';

// Database client
const prisma = new PrismaClient();

// Available models for realistic data generation
const POPULAR_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'gemini-1.5-pro-002',
  'gemini-1.5-flash-002',
];

// Provider mapping
const MODEL_PROVIDERS: Record<string, string> = {
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai',
  'gpt-4-turbo': 'openai',
  'claude-3-5-sonnet-20241022': 'anthropic',
  'claude-3-5-haiku-20241022': 'anthropic',
  'claude-3-opus-20240229': 'anthropic',
  'gemini-1.5-pro-002': 'google',
  'gemini-1.5-flash-002': 'google',
};

// Sample prompts for realistic data
const SAMPLE_PROMPTS = [
  'Write a brief summary of the main features of React',
  'Explain how to implement authentication in a web application',
  'What are the best practices for database design?',
  'Create a simple todo list component in TypeScript',
  'How do I optimize SQL queries for better performance?',
  'Explain the difference between REST and GraphQL APIs',
  'Write a function to validate email addresses',
  'What are the security considerations for web applications?',
  'How to implement caching strategies in web development?',
  'Explain the concept of microservices architecture',
];

// Sample responses
const SAMPLE_RESPONSES = [
  "Here's a comprehensive overview of the topic you asked about...",
  'Based on best practices, I recommend the following approach...',
  'Let me break this down into key components and explain each one...',
  "Here's a practical implementation that addresses your requirements...",
  'The most effective strategy for this would be to consider...',
  "I'll provide you with a step-by-step guide to implement this...",
  'There are several important factors to consider when approaching this...',
  "Here's a detailed explanation with examples to illustrate the concept...",
  'The solution involves implementing the following key features...',
  'Let me walk you through the process with concrete examples...',
];

// Sample user data for realistic generation
const SAMPLE_USER_NAMES = [
  'Alice Johnson',
  'Bob Smith',
  'Carol Davis',
  'David Wilson',
  'Emma Brown',
  'Frank Miller',
  'Grace Lee',
  'Henry Taylor',
  'Iris Chen',
  'Jack Anderson',
  'Kate Rodriguez',
  'Liam Thompson',
  'Maya Patel',
  'Noah Garcia',
  'Olivia Martinez',
];

import {
  AppRole,
  MembershipStatus,
  ApiKeyScope,
  APP_ROLES,
  MEMBERSHIP_STATUSES,
  API_KEY_SCOPES,
} from '../src/lib/shared/enums';

const USER_ROLES = [AppRole.OWNER, AppRole.ADMIN, AppRole.CUSTOMER] as const;
const MEMBERSHIP_STATUS_OPTIONS = [
  MembershipStatus.ACTIVE,
  MembershipStatus.PENDING,
] as const;
const API_KEY_SCOPE_OPTIONS = [
  ApiKeyScope.OWNER,
  ApiKeyScope.ADMIN,
  ApiKeyScope.CUSTOMER,
] as const;

interface SeedOptions {
  appId?: string;
  days?: number;
  transactionsPerDay?: number;
  verbose?: boolean;
  users?: number;
  apiKeysPerUser?: number;
  forceNewUsers?: boolean;
}

/**
 * Generate random number between min and max (inclusive)
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random date within the last N days
 */
function randomDateWithinDays(days: number): Date {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const randomMs = Math.random() * days * msPerDay;
  return new Date(now.getTime() - randomMs);
}

/**
 * Calculate cost for a transaction based on model and token counts
 */
function calculateTransactionCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const modelData = modelPrices[model as keyof typeof modelPrices];
  if (!modelData) {
    console.warn(
      `Model ${model} not found in pricing data, using default cost`
    );
    return (inputTokens + outputTokens) * 0.00001; // Fallback rate
  }

  const inputCost = inputTokens * (modelData.input_cost_per_token || 0);
  const outputCost = outputTokens * (modelData.output_cost_per_token || 0);
  return inputCost + outputCost;
}

/**
 * Generate a realistic email based on name
 */
function generateEmail(name: string, suffix: string = ''): string {
  const nameParts = name.toLowerCase().split(' ');
  const baseEmail = nameParts.join('.');
  const timestamp = Date.now();
  return `${baseEmail}${suffix ? '.' + suffix : ''}.${timestamp}@example.com`;
}

/**
 * Create a single user with realistic data
 */
async function createTestUser(
  name: string,
  suffix: string = ''
): Promise<string> {
  const email = generateEmail(name, suffix);
  const clerkId = `test_clerk_${crypto.randomUUID()}`;

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      name,
      clerkId,
    },
  });

  return user.id;
}

/**
 * Create app membership for a user
 */
async function createAppMembership(
  userId: string,
  appId: string,
  role: (typeof USER_ROLES)[number],
  status: (typeof MEMBERSHIP_STATUS_OPTIONS)[number] = MembershipStatus.ACTIVE
): Promise<void> {
  await prisma.appMembership.create({
    data: {
      userId,
      echoAppId: appId,
      role,
      status,
      totalSpent: 0, // Will be updated as transactions are created
    },
  });
}

/**
 * Create API key for a user and app
 */
async function createApiKey(
  userId: string,
  appId: string,
  name: string,
  scope: (typeof API_KEY_SCOPES)[number]
): Promise<string> {
  const keyValue = `test-key-${crypto.randomUUID()}`;
  const keyHash = crypto
    .createHmac('sha256', 'test-secret')
    .update(keyValue)
    .digest('hex');

  const apiKey = await prisma.apiKey.create({
    data: {
      id: crypto.randomUUID(),
      keyHash,
      name,
      userId,
      echoAppId: appId,
      scope,
    },
  });

  return apiKey.id;
}

/**
 * Create multiple users with memberships and API keys for an app
 */
async function createUsersForApp(
  appId: string,
  userCount: number,
  apiKeysPerUser: number,
  verbose: boolean = false
): Promise<Array<{ userId: string; apiKeyIds: string[] }>> {
  if (verbose) {
    console.log(`👥 Creating ${userCount} users for app...`);
  }

  const users = [];

  for (let i = 0; i < userCount; i++) {
    // Pick a random name
    const name = SAMPLE_USER_NAMES[i % SAMPLE_USER_NAMES.length];
    const suffix =
      i >= SAMPLE_USER_NAMES.length
        ? `${Math.floor(i / SAMPLE_USER_NAMES.length)}`
        : '';

    // Create user
    const userId = await createTestUser(name, suffix);

    // Determine role - first user is always owner, then mix of admin/customer
    let role: (typeof USER_ROLES)[number];
    if (i === 0) {
      role = AppRole.OWNER;
    } else if (i < Math.ceil(userCount * 0.2)) {
      role = AppRole.ADMIN; // 20% admins
    } else {
      role = AppRole.CUSTOMER; // Rest are customers
    }

    // Create app membership
    await createAppMembership(userId, appId, role);

    // Create API keys for this user
    const apiKeyIds = [];
    for (let j = 0; j < apiKeysPerUser; j++) {
      const keyName =
        apiKeysPerUser === 1
          ? `${name}'s API Key`
          : `${name}'s API Key ${j + 1}`;

      // API key scope should not exceed user's membership role
      let keyScope: (typeof API_KEY_SCOPE_OPTIONS)[number];
      if (role === AppRole.OWNER) {
        keyScope = [ApiKeyScope.OWNER, ApiKeyScope.ADMIN, ApiKeyScope.CUSTOMER][
          Math.floor(Math.random() * 3)
        ];
      } else if (role === AppRole.ADMIN) {
        keyScope = [ApiKeyScope.ADMIN, ApiKeyScope.CUSTOMER][
          Math.floor(Math.random() * 2)
        ];
      } else {
        keyScope = ApiKeyScope.CUSTOMER;
      }

      const apiKeyId = await createApiKey(userId, appId, keyName, keyScope);
      apiKeyIds.push(apiKeyId);
    }

    users.push({ userId, apiKeyIds });

    if (verbose && (i + 1) % 5 === 0) {
      console.log(`  ✓ Created ${i + 1}/${userCount} users...`);
    }
  }

  if (verbose) {
    console.log(`✅ Created ${userCount} users with memberships and API keys`);
  }

  return users;
}

/**
 * Generate a realistic transaction for an app
 */
function generateTransaction(
  appId: string,
  userId: string,
  apiKeyId: string | null,
  createdAt: Date
) {
  // Pick a random model
  const model =
    POPULAR_MODELS[Math.floor(Math.random() * POPULAR_MODELS.length)];
  const providerId = MODEL_PROVIDERS[model] || 'openai';

  // Generate realistic token counts
  const inputTokens = randomBetween(50, 2000);
  const outputTokens = randomBetween(20, 1000);
  const totalTokens = inputTokens + outputTokens;

  // Calculate cost
  const cost = calculateTransactionCost(model, inputTokens, outputTokens);

  // Pick random prompt and response
  const prompt =
    SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
  const response =
    SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)];

  // Status is mostly successful
  const status =
    Math.random() < 0.95
      ? 'completed'
      : Math.random() < 0.5
        ? 'error'
        : 'timeout';
  const errorMessage =
    status !== 'completed' ? 'Request failed due to rate limiting' : null;

  return {
    id: crypto.randomUUID(),
    providerId,
    model,
    inputTokens,
    outputTokens,
    totalTokens,
    cost,
    prompt,
    response: status === 'completed' ? response : null,
    status,
    errorMessage,
    createdAt,
    userId,
    echoAppId: appId,
    apiKeyId,
    // Generate a placeholder usageProductId for seeding
    usageProductId: crypto.randomUUID(),
  };
}

/**
 * Seed usage data for a specific app
 */
async function seedAppUsage(
  appId: string,
  options: SeedOptions
): Promise<number> {
  const {
    days = 30,
    transactionsPerDay = 50,
    users = 5,
    apiKeysPerUser = 2,
    verbose = false,
    forceNewUsers = false,
  } = options;

  if (verbose) {
    console.log(`🌱 Seeding usage data for app: ${appId}`);
  }

  // Verify app exists
  const app = await prisma.echoApp.findUnique({
    where: { id: appId },
  });

  if (!app) {
    throw new Error(`App with ID ${appId} not found`);
  }

  // Check if users already exist for this app
  const existingMemberships = await prisma.appMembership.count({
    where: { echoAppId: appId },
  });

  let appUsers: Array<{ userId: string; apiKeyIds: string[] }>;

  if (existingMemberships > 0 && !forceNewUsers) {
    if (verbose) {
      console.log(
        `📋 Found ${existingMemberships} existing memberships, using existing users`
      );
    }

    // Use existing users
    const memberships = await prisma.appMembership.findMany({
      where: {
        echoAppId: appId,
        status: 'active',
      },
      include: {
        user: {
          include: {
            apiKeys: {
              where: {
                echoAppId: appId,
                isArchived: false,
              },
            },
          },
        },
      },
    });

    appUsers = memberships.map(membership => ({
      userId: membership.userId,
      apiKeyIds: membership.user.apiKeys.map(key => key.id),
    }));
  } else {
    if (verbose) {
      console.log(`👥 No existing users found, creating ${users} new users`);
    }

    // Create new users with memberships and API keys
    appUsers = await createUsersForApp(appId, users, apiKeysPerUser, verbose);
  }

  if (appUsers.length === 0) {
    throw new Error('No users available for transaction generation');
  }

  // Generate transactions distributed across all users
  const transactions = [];
  for (let day = 0; day < days; day++) {
    // Variable number of transactions per day (some days more active than others)
    const dayTransactions = randomBetween(
      Math.floor(transactionsPerDay * 0.5),
      Math.floor(transactionsPerDay * 1.5)
    );

    for (let i = 0; i < dayTransactions; i++) {
      const createdAt = randomDateWithinDays(days - day);

      // Pick a random user and one of their API keys
      const userIndex = Math.floor(Math.random() * appUsers.length);
      const user = appUsers[userIndex];
      const apiKeyId =
        user.apiKeyIds.length > 0
          ? user.apiKeyIds[Math.floor(Math.random() * user.apiKeyIds.length)]
          : null;

      transactions.push(
        generateTransaction(appId, user.userId, apiKeyId, createdAt)
      );
    }
  }

  // Sort by creation date for more realistic insertion
  transactions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // Insert transactions in batches
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await prisma.transaction.createMany({
      data: batch,
    });
    totalInserted += batch.length;

    if (verbose && totalInserted % 500 === 0) {
      console.log(
        `  📊 Inserted ${totalInserted}/${transactions.length} transactions...`
      );
    }
  }

  // Update total spent for each user and their app membership
  const userSpending = new Map<string, number>();
  transactions.forEach(tx => {
    const current = userSpending.get(tx.userId) || 0;
    userSpending.set(tx.userId, current + tx.cost);
  });

  // Balance checking disabled - balance tracking moved to credit grants
  console.log(
    'Skipping balance validation as totalPaid/totalSpent removed from users table'
  );

  // Create debit credit grants for user spending (instead of updating totalSpent directly)
  for (const [userId, totalCost] of userSpending.entries()) {
    // Create a debit credit grant for the total spending
    await prisma.creditGrant.create({
      data: {
        type: 'debit',
        amount: totalCost,
        source: 'transaction',
        description: `Seeded LLM usage for app: ${app.name}`,
        userId: userId,
      },
    });

    // Still update app membership total spent for app-specific tracking
    await prisma.appMembership.update({
      where: {
        userId_echoAppId: {
          userId,
          echoAppId: appId,
        },
      },
      data: {
        totalSpent: {
          increment: totalCost,
        },
      },
    });
  }

  if (verbose) {
    const totalCost = transactions.reduce((sum, tx) => sum + tx.cost, 0);
    console.log(`✅ Seeded ${totalInserted} transactions for app ${app.name}`);
    console.log(`👥 Distributed across ${appUsers.length} users`);
    console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  }

  return totalInserted;
}

/**
 * Seed usage data for all apps
 */
async function seedAllApps(options: SeedOptions): Promise<void> {
  const { verbose = false } = options;

  if (verbose) {
    console.log('🔍 Finding all active apps...');
  }

  const apps = await prisma.echoApp.findMany({
    where: {
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (apps.length === 0) {
    console.log('⚠️  No active apps found to seed');
    return;
  }

  if (verbose) {
    console.log(`📱 Found ${apps.length} active apps to seed`);
  }

  let totalTransactions = 0;
  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    if (verbose) {
      console.log(`\n[${i + 1}/${apps.length}] Processing app: ${app.name}`);
    }

    const count = await seedAppUsage(app.id, options);
    totalTransactions += count;
  }

  console.log(
    `\n🎉 Successfully seeded ${totalTransactions} total transactions across ${apps.length} apps`
  );
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Skip any leading '--' separators (added by npm/pnpm)
  let startIndex = 0;
  while (startIndex < args.length && args[startIndex] === '--') {
    startIndex++;
  }

  // Find the app ID (first argument after -- that doesn't start with --)
  let appId: string | undefined;
  let argStartIndex = startIndex;

  if (startIndex < args.length && !args[startIndex].startsWith('--')) {
    appId = args[startIndex];
    argStartIndex = startIndex + 1;
  }

  // Parse options
  const options: SeedOptions = {
    days: 30,
    transactionsPerDay: 50,
    users: 5,
    apiKeysPerUser: 2,
    verbose: true,
  };

  // Override options from command line
  for (let i = argStartIndex; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--days' && args[i + 1]) {
      options.days = parseInt(args[i + 1]);
      i++;
    } else if (arg === '--transactions-per-day' && args[i + 1]) {
      options.transactionsPerDay = parseInt(args[i + 1]);
      i++;
    } else if (arg === '--users' && args[i + 1]) {
      options.users = parseInt(args[i + 1]);
      i++;
    } else if (arg === '--api-keys-per-user' && args[i + 1]) {
      options.apiKeysPerUser = parseInt(args[i + 1]);
      i++;
    } else if (arg === '--quiet') {
      options.verbose = false;
    } else if (arg === '--force-new-users') {
      options.forceNewUsers = true;
    }
  }

  console.log('🚀 Starting app usage seeding...');
  console.log(`📊 Configuration:`);
  if (appId) {
    console.log(`   Target app: ${appId}`);
  } else {
    console.log(`   Target: All apps`);
  }
  console.log(`   Days back: ${options.days}`);
  console.log(`   Transactions per day: ${options.transactionsPerDay}`);
  console.log(`   Users to create: ${options.users}`);
  console.log(`   API keys per user: ${options.apiKeysPerUser}`);
  console.log(`   Force new users: ${options.forceNewUsers ? 'Yes' : 'No'}`);
  console.log();

  try {
    if (appId) {
      const count = await seedAppUsage(appId, options);
      console.log(
        `\n🎉 Successfully seeded ${count} transactions for app ${appId}`
      );
    } else {
      await seedAllApps(options);
    }
  } catch (error) {
    console.error('❌ Error seeding usage data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Show usage information
function showUsage(): void {
  console.log(`
Usage: tsx scripts/seed-app-usage.ts [app_id] [options]

Arguments:
  app_id                    Specific app ID to seed (optional, seeds all apps if not provided)

Options:
  --days <number>           Number of days back to generate data (default: 30)
  --transactions-per-day <number>  Average transactions per day (default: 50)
  --users <number>          Number of users to create (default: 5)
  --api-keys-per-user <number>     Number of API keys per user (default: 2)
  --quiet                   Suppress verbose output
  --force-new-users         Force creation of new users even if existing ones are found

Examples:
  tsx scripts/seed-app-usage.ts                                    # Seed all apps
  tsx scripts/seed-app-usage.ts 12345-app-id                      # Seed specific app
  tsx scripts/seed-app-usage.ts --days 7 --transactions-per-day 100  # Custom options
  tsx scripts/seed-app-usage.ts 12345-app-id --days 14            # Specific app, 14 days
  tsx scripts/seed-app-usage.ts --users 10 --api-keys-per-user 3  # More users and keys
  tsx scripts/seed-app-usage.ts 12345-app-id --users 3 --days 7   # Specific app with fewer users
  tsx scripts/seed-app-usage.ts 12345-app-id --force-new-users    # Force new users for specific app
`);
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Auto-run when called directly
if (typeof require !== 'undefined' && require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { seedAppUsage, seedAllApps };
