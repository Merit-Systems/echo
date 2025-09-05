#!/usr/bin/env tsx

import { db } from '../src/lib/db';
import { faker } from '@faker-js/faker';
import { subDays, addDays, format } from 'date-fns';

interface SeedAppUsageOptions {
  appId: string;
  days: number;
  transactionsPerDay: number;
  users: number;
  quiet?: boolean;
  updateCreatedAt?: boolean;
}

function parseArgs(): SeedAppUsageOptions {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: App ID is required');
    console.log('Usage: tsx seed-app-usage.ts <app_id> [options]');
    console.log('Run "tsx seed-app-usage.ts --help" for more information');
    process.exit(1);
  }

  const options: SeedAppUsageOptions = {
    appId: args[0],
    days: 30,
    transactionsPerDay: 50,
    users: 5,
    quiet: false,
    updateCreatedAt: true,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--days':
        options.days = parseInt(args[++i], 10);
        break;
      case '--transactions-per-day':
        options.transactionsPerDay = parseInt(args[++i], 10);
        break;
      case '--users':
        options.users = parseInt(args[++i], 10);
        break;
      case '--quiet':
        options.quiet = true;
        break;
      case '--no-update-created-at':
        options.updateCreatedAt = false;
        break;
      case '--help':
      case '-h':
        console.log(`
Seed App Usage Script

Usage: tsx seed-app-usage.ts <app_id> [options]

Arguments:
  app_id                    Specific app ID to seed usage for (required)

Options:
  --days <number>           Number of days back to generate data (default: 30)
  --transactions-per-day <number>  Average transactions per day (default: 50)
  --users <number>          Number of users to generate transactions for (default: 5)
  --quiet                   Suppress verbose output
  --no-update-created-at    Don't update app's createdAt to first transaction date (default: update)
  --help, -h                Show this help message

Examples:
  tsx seed-app-usage.ts 12345-app-id                                # Seed specific app
  tsx seed-app-usage.ts 12345-app-id --days 7 --transactions-per-day 100  # Custom options
  tsx seed-app-usage.ts 12345-app-id --days 14 --users 10          # 14 days, 10 users
  tsx seed-app-usage.ts 12345-app-id --no-update-created-at        # Don't update app createdAt
        `);
        process.exit(0);
    }
  }

  return options;
}

async function validateEchoApp(appId: string): Promise<boolean> {
  try {
    const app = await db.echoApp.findUnique({
      where: { id: appId },
      select: { id: true, name: true },
    });

    if (!app) {
      console.error(`❌ Error: Echo App with ID '${appId}' not found`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error validating Echo App:', error);
    return false;
  }
}

async function getOrCreateUsers(
  appId: string,
  count: number,
  quiet: boolean
): Promise<string[]> {
  // First, try to get existing users for this app
  const existingUsers = await db.user.findMany({
    where: {
      appMemberships: {
        some: {
          echoAppId: appId,
          isArchived: false,
        },
      },
    },
    select: { id: true },
    take: count,
  });

  if (existingUsers.length >= count) {
    if (!quiet) {
      console.log(`✅ Found ${existingUsers.length} existing users for app`);
    }
    return existingUsers.slice(0, count).map(user => user.id);
  }

  // If we don't have enough users, create more
  const usersToCreate = count - existingUsers.length;
  if (!quiet) {
    console.log(`📝 Creating ${usersToCreate} additional users...`);
  }

  const newUserIds: string[] = [];
  for (let i = 0; i < usersToCreate; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName });
    const image = faker.image.avatar();

    const user = await db.user.create({
      data: {
        email,
        name,
        image,
        totalPaid: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
        totalSpent: faker.number.float({ min: 0, max: 500, fractionDigits: 2 }),
        appMemberships: {
          create: {
            echoAppId: appId,
            role: 'user',
            totalSpent: faker.number.float({
              min: 0,
              max: 200,
              fractionDigits: 2,
            }),
            amountSpent: faker.number.float({
              min: 0,
              max: 100,
              fractionDigits: 2,
            }),
          },
        },
      },
    });

    newUserIds.push(user.id);
  }

  return [...existingUsers.map(user => user.id), ...newUserIds];
}

function generateTransactionMetadata() {
  const providers = ['openai', 'anthropic', 'google'];
  const models = {
    openai: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    google: ['gemini-pro', 'gemini-pro-vision'],
  };

  const provider = faker.helpers.arrayElement(providers);
  const model = faker.helpers.arrayElement(
    models[provider as keyof typeof models]
  );

  const inputTokens = faker.number.int({ min: 10, max: 2000 });
  const outputTokens = faker.number.int({ min: 5, max: 1000 });
  const totalTokens = inputTokens + outputTokens;

  return {
    providerId: faker.string.uuid(),
    provider,
    model,
    inputTokens,
    outputTokens,
    totalTokens,
    toolCost: faker.number.float({ min: 0, max: 0.1, fractionDigits: 3 }),
    prompt: faker.lorem.paragraph(),
  };
}

async function createTransaction(
  userId: string,
  appId: string,
  date: Date,
  quiet: boolean
): Promise<void> {
  const metadata = generateTransactionMetadata();

  // Create transaction metadata first
  const transactionMetadata = await db.transactionMetadata.create({
    data: metadata,
  });

  // Calculate costs based on realistic pricing
  const baseCostPerToken = 0.00001; // $0.00001 per token
  const rawCost = metadata.totalTokens * baseCostPerToken + metadata.toolCost;
  const markupMultiplier = faker.number.float({
    min: 1.1,
    max: 2.0,
    fractionDigits: 1,
  });
  const totalCost = rawCost * markupMultiplier;
  const markupProfit = totalCost - rawCost;
  const appProfit =
    markupProfit *
    faker.number.float({ min: 0.7, max: 0.9, fractionDigits: 2 });
  const referralProfit = markupProfit - appProfit;

  // Create the transaction
  await db.transaction.create({
    data: {
      userId,
      echoAppId: appId,
      transactionMetadataId: transactionMetadata.id,
      totalCost,
      appProfit,
      markUpProfit: markupProfit,
      referralProfit,
      rawTransactionCost: rawCost,
      status: 'completed',
      createdAt: date,
    },
  });

  if (!quiet) {
    console.log(
      `💳 Created transaction for user ${userId} at ${format(date, 'yyyy-MM-dd HH:mm:ss')}`
    );
  }
}

async function updateAppCreatedAt(
  appId: string,
  quiet: boolean
): Promise<void> {
  // Find the earliest transaction for this app
  const earliestTransaction = await db.transaction.findFirst({
    where: { echoAppId: appId },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  });

  if (!earliestTransaction) {
    if (!quiet) {
      console.log('⚠️  No transactions found, skipping createdAt update');
    }
    return;
  }

  // Update the app's createdAt to match the earliest transaction minus one day
  await db.echoApp.update({
    where: { id: appId },
    data: { createdAt: subDays(earliestTransaction.createdAt, 1) },
  });

  if (!quiet) {
    console.log(
      `📅 Updated app createdAt to ${format(earliestTransaction.createdAt, 'yyyy-MM-dd HH:mm:ss')}`
    );
  }
}

async function createRefreshToken(
  userId: string,
  appId: string,
  date: Date,
  quiet: boolean
): Promise<void> {
  // First create an AppSession
  const appSession = await db.appSession.create({
    data: {
      userId,
      echoAppId: appId,
      deviceName: faker.helpers.arrayElement([
        'iPhone',
        'Android',
        'Desktop',
        'Tablet',
        'Web Browser',
      ]),
      userAgent: faker.internet.userAgent(),
      ipAddress: faker.internet.ip(),
      createdAt: date,
      lastSeenAt: date,
    },
  });

  // Then create the RefreshToken with the valid sessionId
  await db.refreshToken.create({
    data: {
      userId,
      echoAppId: appId,
      token: faker.string.uuid(),
      expiresAt: addDays(date, 7),
      scope: 'llm:invoke offline_access',
      sessionId: appSession.id,
      createdAt: date,
    },
  });

  if (!quiet) {
    console.log(
      `🔑 Created refresh token for user ${userId} at ${format(date, 'yyyy-MM-dd HH:mm:ss')}`
    );
  }
}

async function seedAppUsage(): Promise<void> {
  const options = parseArgs();

  if (!options.quiet) {
    console.log(`🚀 Starting to seed app usage for app: ${options.appId}`);
    console.log(
      `📊 Generating ${options.transactionsPerDay} transactions/day for ${options.days} days`
    );
    console.log(`👥 Using ${options.users} users`);
  }

  // Validate Echo App
  const isValid = await validateEchoApp(options.appId);
  if (!isValid) {
    process.exit(1);
  }

  try {
    // Get or create users
    const userIds = await getOrCreateUsers(
      options.appId,
      options.users,
      options.quiet ?? false
    );

    if (!options.quiet) {
      console.log(
        `\n📅 Generating transactions for the past ${options.days} days...`
      );
    }

    const endDate = new Date();
    const startDate = subDays(endDate, options.days);

    let totalTransactions = 0;

    // Generate transactions for each day
    for (let day = 0; day < options.days; day++) {
      const currentDate = addDays(startDate, day);
      const transactionsForDay = faker.number.int({
        min: Math.floor(options.transactionsPerDay * 0.5),
        max: Math.floor(options.transactionsPerDay * 1.5),
      });

      if (!options.quiet) {
        console.log(
          `📅 ${format(currentDate, 'yyyy-MM-dd')}: ${transactionsForDay} transactions`
        );
      }

      // Create transactions for this day
      for (let i = 0; i < transactionsForDay; i++) {
        const randomUser = faker.helpers.arrayElement(userIds);
        const randomHour = faker.number.int({ min: 0, max: 23 });
        const randomMinute = faker.number.int({ min: 0, max: 59 });
        const transactionDate = new Date(currentDate);
        transactionDate.setHours(randomHour, randomMinute, 0, 0);

        await createTransaction(
          randomUser,
          options.appId,
          transactionDate,
          options.quiet ?? false
        );
        totalTransactions++;
      }
      await createRefreshToken(
        faker.helpers.arrayElement(userIds),
        options.appId,
        currentDate,
        options.quiet ?? false
      );
    }

    // Update app's createdAt to match the first transaction if requested
    if (options.updateCreatedAt) {
      if (!options.quiet) {
        console.log(
          '\n🔄 Updating app createdAt to match earliest transaction...'
        );
      }
      await updateAppCreatedAt(options.appId, options.quiet ?? false);
    }

    if (!options.quiet) {
      console.log(
        `\n✅ Successfully created ${totalTransactions} transactions`
      );
      console.log(`✅ App usage seeded for ${options.days} days`);
    }
  } catch (error) {
    console.error('❌ Error seeding app usage:', error);
    process.exit(1);
  }
}

// Run the script
seedAppUsage()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
