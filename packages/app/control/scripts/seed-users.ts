#!/usr/bin/env tsx

import { db } from '../src/lib/db';
import { faker } from '@faker-js/faker';

interface SeedUsersOptions {
  count: number;
  echoAppId?: string;
  role?: string;
  quiet?: boolean;
}

function parseArgs(): SeedUsersOptions {
  const args = process.argv.slice(2);
  const options: SeedUsersOptions = {
    count: 10,
    role: 'user',
    quiet: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--count':
        options.count = parseInt(args[++i], 10);
        break;
      case '--echo-app-id':
        options.echoAppId = args[++i];
        break;
      case '--role':
        options.role = args[++i];
        break;
      case '--quiet':
        options.quiet = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Seed Users Script

Usage: tsx seed-users.ts [options]

Options:
  --count <number>           Number of users to create (default: 10)
  --echo-app-id <uuid>       Echo App ID to associate users with (optional)
  --role <string>            Role for app membership if echo-app-id provided (default: 'user')
  --quiet                    Suppress verbose output
  --help, -h                 Show this help message

Examples:
  tsx seed-users.ts                                              # Create 10 users
  tsx seed-users.ts --count 50                                   # Create 50 users
  tsx seed-users.ts --echo-app-id 12345-app-id                   # Create 10 users for specific app
  tsx seed-users.ts --count 25 --echo-app-id 12345-app-id --role owner  # Create 25 owner users
        `);
        process.exit(0);
    }
  }

  return options;
}

async function validateEchoApp(
  echoAppId: string,
  quiet: boolean
): Promise<boolean> {
  try {
    const app = await db.echoApp.findUnique({
      where: { id: echoAppId },
      select: { id: true, name: true },
    });

    if (!app) {
      console.error(`❌ Error: Echo App with ID '${echoAppId}' not found`);
      return false;
    }

    if (!quiet) {
      console.log(`✅ Found Echo App: ${app.name} (${app.id})`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error validating Echo App:', error);
    return false;
  }
}

async function createUser(
  index: number,
  count: number,
  quiet: boolean
): Promise<string> {
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
    },
  });

  if (!quiet) {
    console.log(`👤 Created user ${index + 1}/${count}: ${name} (${email})`);
  }

  return user.id;
}

async function createAppMembership(
  userId: string,
  echoAppId: string,
  role: string,
  quiet: boolean
): Promise<void> {
  await db.appMembership.create({
    data: {
      userId,
      echoAppId,
      role,
      totalSpent: faker.number.float({ min: 0, max: 200, fractionDigits: 2 }),
      amountSpent: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    },
  });

  if (!quiet) {
    console.log(
      `🔗 Created app membership for user ${userId} with role '${role}'`
    );
  }
}

async function seedUsers(): Promise<void> {
  const options = parseArgs();

  if (!options.quiet) {
    console.log(`🚀 Starting to seed ${options.count} users...`);
  }

  // Validate Echo App if provided
  if (options.echoAppId) {
    const isValid = await validateEchoApp(
      options.echoAppId,
      options.quiet ?? false
    );
    if (!isValid) {
      process.exit(1);
    }
  }

  const userIds: string[] = [];

  try {
    // Create users
    for (let i = 0; i < options.count; i++) {
      const userId = await createUser(i, options.count, options.quiet ?? false);
      userIds.push(userId);
    }

    // Create app memberships if echoAppId is provided
    if (options.echoAppId) {
      if (!options.quiet) {
        console.log(
          `\n🔗 Creating app memberships for Echo App: ${options.echoAppId}`
        );
      }

      for (const userId of userIds) {
        await createAppMembership(
          userId,
          options.echoAppId,
          options.role!,
          options.quiet ?? false
        );
      }
    }

    if (!options.quiet) {
      console.log(`\n✅ Successfully created ${options.count} users`);
      if (options.echoAppId) {
        console.log(`✅ Created app memberships with role: ${options.role}`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

// Run the script
seedUsers()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
