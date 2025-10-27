#!/usr/bin/env tsx

// eslint-disable-next-line no-db-client-outside-db/no-db-client-outside-db
import { db } from '../src/services/db/client';

interface MakeAdminOptions {
  email?: string;
  userId?: string;
  list?: boolean;
}

function parseArgs(): MakeAdminOptions {
  const args = process.argv.slice(2);
  const options: MakeAdminOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--email':
        options.email = args[++i];
        break;
      case '--user-id':
        options.userId = args[++i];
        break;
      case '--list':
        options.list = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Make User Admin Script

Usage: tsx make-user-admin.ts [options]

Options:
  --email <email>        Email of the user to make admin
  --user-id <uuid>       User ID to make admin
  --list                 List all users (useful for finding the right user)
  --help, -h             Show this help message

Examples:
  tsx make-user-admin.ts --list                           # List all users
  tsx make-user-admin.ts --email user@example.com         # Make user admin by email
  tsx make-user-admin.ts --user-id 12345-uuid             # Make user admin by ID

Note: You must provide either --email or --user-id (not both)
        `);
        process.exit(0);
    }
  }

  return options;
}

async function listUsers(): Promise<void> {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        admin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    if (users.length === 0) {
      console.log('No users found in the database.');
      return;
    }

    console.log('\n📋 Users (most recent 50):');
    console.log('─'.repeat(100));
    console.log(
      `${'Email'.padEnd(35)} ${'Name'.padEnd(25)} ${'Admin'.padEnd(7)} ${'ID'}`
    );
    console.log('─'.repeat(100));

    for (const user of users) {
      const email = user.email.padEnd(35);
      const name = (user.name ?? '<no name>').padEnd(25).slice(0, 25);
      const isAdmin = (user.admin ? '✓ Yes' : '✗ No').padEnd(7);
      console.log(`${email} ${name} ${isAdmin} ${user.id}`);
    }

    console.log('─'.repeat(100));
    console.log(
      `\nTotal: ${users.length} user${users.length !== 1 ? 's' : ''} shown`
    );
  } catch (error) {
    console.error('❌ Error listing users:', error);
    process.exit(1);
  }
}

async function makeUserAdmin(email?: string, userId?: string): Promise<void> {
  try {
    // Validate input
    if (email && userId) {
      console.error(
        '❌ Error: Please provide either --email or --user-id, not both'
      );
      process.exit(1);
    }

    if (!email && !userId) {
      console.error(
        '❌ Error: Please provide either --email or --user-id\nUse --help for usage information'
      );
      process.exit(1);
    }

    // Find the user
    const user = await db.user.findFirst({
      where: email ? { email } : { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        admin: true,
      },
    });

    if (!user) {
      const identifier = email ? `email '${email}'` : `ID '${userId}'`;
      console.error(`❌ Error: User with ${identifier} not found`);
      process.exit(1);
    }

    // Check if already admin
    if (user.admin) {
      console.log(
        `ℹ️  User ${user.name ?? user.email} is already an admin. No changes needed.`
      );
      process.exit(0);
    }

    // Update user to admin
    await db.user.update({
      where: { id: user.id },
      data: { admin: true },
    });

    console.log(`✅ Successfully made user an admin!`);
    console.log(`   Name:  ${user.name ?? '<no name>'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID:    ${user.id}`);
    console.log(
      '\n🔐 This user can now access the admin dashboard at /admin/dashboard'
    );
  } catch (error) {
    console.error('❌ Error making user admin:', error);
    process.exit(1);
  }
}

// Run the script
async function main() {
  const options = parseArgs();

  if (options.list) {
    await listUsers();
  } else {
    await makeUserAdmin(options.email, options.userId);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
