#!/usr/bin/env tsx

import { db } from '../src/lib/db';
import { faker } from '@faker-js/faker';
import { addDays, subDays, format } from 'date-fns';

interface SeedReferralRewardsOptions {
  referrerUserId?: string; // If not provided, create a new user
  referrerEmail?: string; // If not provided, default to a known email
  appId?: string; // If not provided, create a new app owned by referrer
  referredUsers: number; // Number of referred users to create
  transactionsPerUser: number; // Transactions per referred user
  days: number; // Days back to spread transactions
  quiet?: boolean;
}

function parseArgs(): SeedReferralRewardsOptions {
  const args = process.argv.slice(2);

  const options: SeedReferralRewardsOptions = {
    referrerEmail: 'benreilly19@gmail.com',
    referredUsers: 3,
    transactionsPerUser: 10,
    days: 14,
    quiet: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--referrer-user-id':
        options.referrerUserId = args[++i];
        break;
      case '--referrer-email':
        options.referrerEmail = args[++i];
        break;
      case '--app-id':
        options.appId = args[++i];
        break;
      case '--referred-users':
        options.referredUsers = parseInt(args[++i], 10);
        break;
      case '--transactions-per-user':
        options.transactionsPerUser = parseInt(args[++i], 10);
        break;
      case '--days':
        options.days = parseInt(args[++i], 10);
        break;
      case '--quiet':
        options.quiet = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Seed Referral Rewards Script

Usage: tsx seed-referral-rewards.ts [options]

Options:
  --referrer-user-id <uuid>    Use existing user as referrer (optional)
  --referrer-email <email>     Use/find/create user by email as referrer (default: benreilly19@gmail.com)
  --app-id <uuid>              Use existing app to attribute referrals to (optional)
  --referred-users <number>    Number of referred users to create (default: 3)
  --transactions-per-user <n>  Transactions to generate per referred user (default: 10)
  --days <number>              Days back to spread transactions (default: 14)
  --quiet                      Suppress verbose output
  --help, -h                   Show this help message

Examples:
  tsx seed-referral-rewards.ts                                   # Create referrer, app, referrals
  tsx seed-referral-rewards.ts --referred-users 5                # 5 referred users
  tsx seed-referral-rewards.ts --referrer-user-id <uuid>         # Use existing referrer
  tsx seed-referral-rewards.ts --referrer-email someone@example.com  # Use/create referrer by email
  tsx seed-referral-rewards.ts --app-id <uuid>                   # Use existing app
        `);
        process.exit(0);
    }
  }

  return options;
}

async function getOrCreateReferrerUser(
  providedUserId?: string,
  providedEmail?: string,
  quiet?: boolean
) {
  if (providedUserId) {
    const existing = await db.user.findUnique({
      where: { id: providedUserId },
      select: { id: true, email: true, name: true },
    });
    if (!existing) {
      throw new Error(`Referrer user not found: ${providedUserId}`);
    }
    if (!quiet)
      console.log(
        `✅ Using existing referrer user: ${existing.name ?? existing.email} (${existing.id})`
      );
    return existing.id;
  }

  if (providedEmail) {
    const existingByEmail = await db.user.findUnique({
      where: { email: providedEmail },
      select: { id: true, email: true, name: true },
    });
    if (existingByEmail) {
      if (!quiet)
        console.log(
          `✅ Using existing referrer by email: ${existingByEmail.email} (${existingByEmail.id})`
        );
      return existingByEmail.id;
    }

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const created = await db.user.create({
      data: {
        email: providedEmail,
        name: `${firstName} ${lastName}`,
        image: faker.image.avatar(),
      },
      select: { id: true, email: true },
    });
    if (!quiet)
      console.log(
        `👤 Created referrer user for email ${providedEmail}: ${created.id}`
      );
    return created.id;
  }

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const user = await db.user.create({
    data: {
      email: faker.internet.email({ firstName, lastName }),
      name: `${firstName} ${lastName}`,
      image: faker.image.avatar(),
    },
    select: { id: true },
  });
  if (!quiet) console.log(`👤 Created referrer user: ${user.id}`);
  return user.id;
}

async function getOrCreateApp(
  referrerUserId: string,
  providedAppId?: string,
  quiet?: boolean
): Promise<{ appId: string; ownerUserId?: string }> {
  if (providedAppId) {
    const existing = await db.echoApp.findUnique({
      where: { id: providedAppId },
      select: { id: true, name: true },
    });
    if (!existing) {
      throw new Error(`Echo App not found: ${providedAppId}`);
    }
    if (!quiet)
      console.log(`✅ Using existing app: ${existing.name} (${existing.id})`);
    return { appId: existing.id };
  }

  // Create a distinct owner user for the new app (different from referrer)
  const ownerFirst = faker.person.firstName();
  const ownerLast = faker.person.lastName();
  const owner = await db.user.create({
    data: {
      email: faker.internet.email({
        firstName: ownerFirst,
        lastName: ownerLast,
      }),
      name: `${ownerFirst} ${ownerLast}`,
      image: faker.image.avatar(),
    },
    select: { id: true, email: true },
  });
  if (!quiet)
    console.log(`👑 Created app owner user: ${owner.email} (${owner.id})`);

  const app = await db.echoApp.create({
    data: {
      name: `${faker.company.name()} AI`,
      description: faker.company.catchPhrase(),
      profilePictureUrl: faker.image.url(),
      authorizedCallbackUrls: ['http://localhost:3000/callback'],
      appMemberships: {
        create: {
          userId: owner.id,
          role: 'owner',
          totalSpent: 0,
          amountSpent: 0,
        },
      },
    },
    select: { id: true, name: true },
  });
  if (!quiet) console.log(`🧩 Created app: ${app.name} (${app.id})`);
  return { appId: app.id, ownerUserId: owner.id };
}

async function createReferralCodeForUser(
  userId: string,
  appId: string,
  quiet?: boolean
) {
  const code = faker.string.alphanumeric({ length: 8 }).toUpperCase();
  const referralCode = await db.referralCode.create({
    data: {
      code,
      userId,
      echoAppId: appId,
      grantType: 'referral',
      reusable: true,
      expiresAt: addDays(new Date(), 365),
      isUsed: false,
    },
    select: { id: true, code: true },
  });
  if (!quiet)
    console.log(
      `🎟️ Created referral code ${referralCode.code} (${referralCode.id})`
    );
  return referralCode;
}

async function createReferredUser(
  appId: string,
  referralCodeId: string,
  quiet?: boolean
) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  const email = faker.internet.email({ firstName, lastName });

  const user = await db.user.create({
    data: {
      email,
      name,
      image: faker.image.avatar(),
      appMemberships: {
        create: {
          echoAppId: appId,
          role: 'user',
          totalSpent: 0,
          amountSpent: 0,
          referrerId: referralCodeId,
        },
      },
    },
    select: { id: true },
  });
  if (!quiet) console.log(`🙋 Referred user created: ${user.id}`);
  return user.id;
}

function generateTransactionMetadata() {
  const providers = ['openai', 'anthropic', 'google'] as const;
  const models: Record<string, string[]> = {
    openai: ['gpt-4', 'gpt-4o', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    google: ['gemini-1.5-pro', 'gemini-pro'],
  };
  const provider = faker.helpers.arrayElement(providers);
  const model = faker.helpers.arrayElement(models[provider]);
  const inputTokens = faker.number.int({ min: 50, max: 3000 });
  const outputTokens = faker.number.int({ min: 10, max: 1500 });
  const totalTokens = inputTokens + outputTokens;
  return {
    providerId: faker.string.uuid(),
    provider,
    model,
    inputTokens,
    outputTokens,
    totalTokens,
    toolCost: faker.number.float({ min: 0, max: 0.05, fractionDigits: 4 }),
    prompt: faker.lorem.sentence(),
  };
}

async function createReferralTransaction(
  userId: string,
  appId: string,
  referralCodeId: string,
  referralRewardId: string | null,
  date: Date,
  quiet?: boolean
) {
  const metadata = generateTransactionMetadata();

  const transactionMetadata = await db.transactionMetadata.create({
    data: metadata,
    select: { id: true },
  });

  const baseCostPerToken = 0.00001;
  const rawCost =
    metadata.totalTokens * baseCostPerToken + Number(metadata.toolCost);
  const markupMultiplier = faker.number.float({
    min: 1.2,
    max: 2.0,
    fractionDigits: 1,
  });
  const totalCost = rawCost * markupMultiplier;
  const markupProfit = totalCost - rawCost;
  // Allocate a healthy referral share so it's clearly claimable
  const appShare = faker.number.float({
    min: 0.4,
    max: 0.7,
    fractionDigits: 2,
  });
  const appProfit = markupProfit * appShare;
  const referralProfit = Math.max(0.01, markupProfit - appProfit);

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
      referralCodeId,
      referrerRewardId: referralRewardId ?? undefined,
    },
    select: { id: true },
  });

  if (!quiet)
    console.log(
      `💸 Referral transaction created for user ${userId} on ${format(date, 'yyyy-MM-dd HH:mm')}`
    );
}

async function ensureReferralReward(
  appId: string,
  quiet?: boolean
): Promise<string> {
  // Create a referral reward and set as current for the app if none exists
  const current = await db.echoApp.findUnique({
    where: { id: appId },
    select: { currentReferralRewardId: true },
  });
  if (current?.currentReferralRewardId) {
    if (!quiet)
      console.log(
        `🏷️ Using existing referral reward: ${current.currentReferralRewardId}`
      );
    return current.currentReferralRewardId;
  }

  const reward = await db.referralReward.create({
    data: {
      echoAppId: appId,
      amount: 1.0,
      description: 'Default referral reward',
    },
    select: { id: true },
  });

  await db.echoApp.update({
    where: { id: appId },
    data: { currentReferralRewardId: reward.id },
  });
  if (!quiet)
    console.log(`🏷️ Created referral reward ${reward.id} and set as current`);
  return reward.id;
}

async function main() {
  const options = parseArgs();

  if (!options.quiet) {
    console.log('🚀 Seeding referral rewards data...');
  }

  try {
    const referrerUserId = await getOrCreateReferrerUser(
      options.referrerUserId,
      options.referrerEmail,
      options.quiet
    );
    const { appId, ownerUserId } = await getOrCreateApp(
      referrerUserId,
      options.appId,
      options.quiet
    );
    const referralCode = await createReferralCodeForUser(
      referrerUserId,
      appId,
      options.quiet
    );
    const referralRewardId = await ensureReferralReward(appId, options.quiet);

    const endDate = new Date();
    const startDate = subDays(endDate, options.days);

    const referredUserIds: string[] = [];
    for (let i = 0; i < options.referredUsers; i++) {
      const referredUserId = await createReferredUser(
        appId,
        referralCode.id,
        options.quiet
      );
      referredUserIds.push(referredUserId);
    }

    let totalTransactions = 0;

    for (const referredUserId of referredUserIds) {
      for (let t = 0; t < options.transactionsPerUser; t++) {
        const dayOffset = faker.number.int({ min: 0, max: options.days - 1 });
        const txDateBase = addDays(startDate, dayOffset);
        const txDate = new Date(txDateBase);
        txDate.setHours(
          faker.number.int({ min: 8, max: 22 }),
          faker.number.int({ min: 0, max: 59 }),
          0,
          0
        );
        await createReferralTransaction(
          referredUserId,
          appId,
          referralCode.id,
          referralRewardId,
          txDate,
          options.quiet
        );
        totalTransactions++;
      }
    }

    // Summary: compute totals for claimable
    const referralTotals = await db.$queryRaw<
      Array<{ appId: string; totalReferralReward: string }>
    >`
      SELECT t."echoAppId" as "appId", COALESCE(SUM(t."referralProfit"), 0)::text as "totalReferralReward"
      FROM transactions t
      WHERE t."referralCodeId" = ${referralCode.id}::uuid AND t."isArchived" = false
      GROUP BY t."echoAppId"`;

    const totalEarned = referralTotals.reduce(
      (sum, r) => sum + Number(r.totalReferralReward),
      0
    );

    if (!options.quiet) {
      console.log('\n✅ Referral rewards seeding complete');
      console.log(`Referrer User ID: ${referrerUserId}`);
      console.log(`App ID: ${appId}`);
      if (ownerUserId) console.log(`App Owner User ID: ${ownerUserId}`);
      console.log(`Referral Code: ${referralCode.code} (${referralCode.id})`);
      console.log(`Referred Users: ${referredUserIds.length}`);
      console.log(`Transactions Created: ${totalTransactions}`);
      console.log(`Total Referral Earned: $${totalEarned.toFixed(2)}`);
      console.log(
        '\nUse the UI to view Referral Earnings and verify a claimable balance.'
      );
    }
  } catch (error) {
    console.error('❌ Error seeding referral rewards:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  });
