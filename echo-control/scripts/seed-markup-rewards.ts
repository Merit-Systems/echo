#!/usr/bin/env tsx

import { db } from '../src/lib/db';
import { faker } from '@faker-js/faker';
import { addDays, subDays, format } from 'date-fns';

interface SeedMarkupRewardsOptions {
  ownerUserId?: string; // If not provided, use/find/create by email
  ownerEmail?: string; // Default to known email
  appId?: string; // If not provided, create a new app owned by owner
  transactions: number; // Total transactions to create across the date window
  days: number; // Days back to spread transactions
  quiet?: boolean;
}

const ALLOWED_GITHUB_IDS = [998427291, 1030000467, 84412547] as const;

function parseArgs(): SeedMarkupRewardsOptions {
  const args = process.argv.slice(2);

  const options: SeedMarkupRewardsOptions = {
    ownerEmail: 'benreilly19@gmail.com',
    transactions: 50,
    days: 14,
    quiet: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--owner-user-id':
        options.ownerUserId = args[++i];
        break;
      case '--owner-email':
        options.ownerEmail = args[++i];
        break;
      case '--app-id':
        options.appId = args[++i];
        break;
      case '--transactions':
        options.transactions = parseInt(args[++i], 10);
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
Seed Markup Rewards Script

Usage: tsx seed-markup-rewards.ts [options]

Options:
  --owner-user-id <uuid>  Use existing user as owner (optional)
  --owner-email <email>   Use/find/create user by email as owner (default: benreilly19@gmail.com)
  --app-id <uuid>         Use existing app to attribute transactions to (optional)
  --transactions <n>      Total transactions to create (default: 50)
  --days <number>         Days back to spread transactions (default: 14)
  --quiet                 Suppress verbose output
  --help, -h              Show this help message

Examples:
  tsx seed-markup-rewards.ts                                 # Create owner, app, markup, github link, transactions
  tsx seed-markup-rewards.ts --transactions 100              # 100 transactions
  tsx seed-markup-rewards.ts --owner-user-id <uuid>          # Use existing owner
  tsx seed-markup-rewards.ts --owner-email someone@example.com
  tsx seed-markup-rewards.ts --app-id <uuid>                 # Use existing app
        `);
        process.exit(0);
    }
  }

  return options;
}

async function getOrCreateOwnerUser(
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
      throw new Error(`Owner user not found: ${providedUserId}`);
    }
    if (!quiet)
      console.log(
        `✅ Using existing owner user: ${existing.name ?? existing.email} (${existing.id})`
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
          `✅ Using existing owner by email: ${existingByEmail.email} (${existingByEmail.id})`
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
        `👤 Created owner user for email ${providedEmail}: ${created.id}`
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
  if (!quiet) console.log(`👤 Created owner user: ${user.id}`);
  return user.id;
}

async function getOrCreateApp(
  ownerUserId: string,
  providedAppId?: string,
  quiet?: boolean
): Promise<{ appId: string }> {
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

  const app = await db.echoApp.create({
    data: {
      name: `${faker.company.name()} AI`,
      description: faker.company.catchPhrase(),
      profilePictureUrl: faker.image.url(),
      authorizedCallbackUrls: ['http://localhost:3000/callback'],
      appMemberships: {
        create: {
          userId: ownerUserId,
          role: 'owner',
          totalSpent: 0,
          amountSpent: 0,
        },
      },
    },
    select: { id: true, name: true },
  });
  if (!quiet) console.log(`🧩 Created app: ${app.name} (${app.id})`);
  return { appId: app.id };
}

async function ensureMarkUp(appId: string, quiet?: boolean) {
  const existing = await db.markUp.findUnique({
    where: { echoAppId: appId },
    select: { id: true, amount: true },
  });
  if (existing) {
    if (!quiet)
      console.log(
        `🏷️ Using existing MarkUp ${existing.id} amount ${Number(existing.amount)}`
      );
    return existing.id;
  }

  const created = await db.markUp.create({
    data: {
      echoAppId: appId,
      amount: faker.number.float({ min: 1.1, max: 2.0, fractionDigits: 2 }),
      description: 'Default markup for app',
    },
    select: { id: true },
  });
  if (!quiet) console.log(`🏷️ Created MarkUp ${created.id}`);
  return created.id;
}

async function ensureGithubLinkForApp(appId: string, quiet?: boolean) {
  // If app already has a github link, use it. Otherwise create one with a random allowed githubId
  const existing = await db.githubLink.findFirst({
    where: { echoAppId: appId, isArchived: false },
    select: { id: true, githubId: true, githubUrl: true },
  });
  if (existing) {
    if (!quiet)
      console.log(
        `🔗 Using existing GitHub link for app ${appId}: ${existing.githubId} (${existing.id})`
      );
    return existing.id;
  }

  const githubId = faker.helpers.arrayElement([...ALLOWED_GITHUB_IDS]);
  const githubType = 'user' as const; // Simplify: use user type
  const githubUrl = `https://github.com/${githubId}`; // Not real, but URL is informational

  const created = await db.githubLink.create({
    data: {
      echoAppId: appId,
      githubId,
      githubType,
      githubUrl,
      description: 'Seeded GitHub link for markup payouts',
    },
    select: { id: true },
  });
  if (!quiet)
    console.log(
      `🔗 Created GitHub link ${githubId} (${created.id}) for app ${appId}`
    );
  return created.id;
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

async function createMarkupTransaction(
  userId: string,
  appId: string,
  githubLinkId: string,
  markUpId: string | null,
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
  const appShare = faker.number.float({
    min: 0.4,
    max: 0.7,
    fractionDigits: 2,
  });
  const appProfit = markupProfit * appShare;

  await db.transaction.create({
    data: {
      userId,
      echoAppId: appId,
      transactionMetadataId: transactionMetadata.id,
      totalCost,
      appProfit,
      markUpProfit: markupProfit,
      referralProfit: 0,
      rawTransactionCost: rawCost,
      status: 'completed',
      createdAt: date,
      markUpId: markUpId ?? undefined,
    },
    select: { id: true },
  });

  if (!quiet)
    console.log(
      `💸 Markup transaction created for user ${userId} on ${format(date, 'yyyy-MM-dd HH:mm')}`
    );
}

async function ensureUserIsMember(userId: string, appId: string) {
  const membership = await db.appMembership.findFirst({
    where: { userId, echoAppId: appId },
    select: { id: true },
  });
  if (membership) return membership.id;
  const created = await db.appMembership.create({
    data: {
      userId,
      echoAppId: appId,
      role: 'user',
      totalSpent: 0,
      amountSpent: 0,
    },
    select: { id: true },
  });
  return created.id;
}

async function main() {
  const options = parseArgs();

  if (!options.quiet) {
    console.log('🚀 Seeding markup rewards data...');
  }

  try {
    const ownerUserId = await getOrCreateOwnerUser(
      options.ownerUserId,
      options.ownerEmail,
      options.quiet
    );
    const { appId } = await getOrCreateApp(
      ownerUserId,
      options.appId,
      options.quiet
    );
    const markUpId = await ensureMarkUp(appId, options.quiet);
    const githubLinkId = await ensureGithubLinkForApp(appId, options.quiet);

    // Ensure owner also has membership as user so transactions can belong to them (not strictly required by schema, but realistic)
    await ensureUserIsMember(ownerUserId, appId);

    const endDate = new Date();
    const startDate = subDays(endDate, options.days);

    let totalTransactions = 0;
    for (let t = 0; t < options.transactions; t++) {
      const dayOffset = faker.number.int({ min: 0, max: options.days - 1 });
      const txDateBase = addDays(startDate, dayOffset);
      const txDate = new Date(txDateBase);
      txDate.setHours(
        faker.number.int({ min: 8, max: 22 }),
        faker.number.int({ min: 0, max: 59 }),
        0,
        0
      );
      await createMarkupTransaction(
        ownerUserId,
        appId,
        githubLinkId,
        markUpId,
        txDate,
        options.quiet
      );
      totalTransactions++;
    }

    // Summary: compute totals for claimable
    const markupTotals = await db.$queryRaw<
      Array<{ appId: string; totalMarkupProfit: string }>
    >`
      SELECT t."echoAppId" as "appId", COALESCE(SUM(t."markUpProfit"), 0)::text as "totalMarkupProfit"
      FROM transactions t
      WHERE t."isArchived" = false
      GROUP BY t."echoAppId"`;

    const totalEarned = markupTotals.reduce(
      (sum, r) => sum + Number(r.totalMarkupProfit),
      0
    );

    if (!options.quiet) {
      console.log('\n✅ Markup rewards seeding complete');
      console.log(`Owner User ID: ${ownerUserId}`);
      console.log(`App ID: ${appId}`);
      console.log(`MarkUp ID: ${markUpId}`);
      console.log(`App GitHub Link ID: ${githubLinkId}`);
      console.log(`Transactions Created: ${totalTransactions}`);
      console.log(`Total Markup Earned: $${totalEarned.toFixed(2)}`);
      console.log(
        '\nUse the UI to view Markup Earnings and verify a claimable balance by GitHub link.'
      );
    }
  } catch (error) {
    console.error('❌ Error seeding markup rewards:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  });
