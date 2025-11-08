/**
 * Script to seed test data for local template referral testing
 * 
 * Creates:
 * - Test user with GitHub link
 * - Test app with membership
 * - Returns app ID for use with echo-start
 */

import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test data for template referral system...\n');

  // Create or get test user
  const testEmail = 'test-template-user@example.com';
  let user = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { githubLink: true },
  });

  if (!user) {
    console.log('Creating test user...');
    user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test Template User',
        githubLink: {
          create: {
            githubId: 123456,
            githubType: 'user',
            githubUrl: 'https://github.com/Trynax',
          },
        },
      },
      include: { githubLink: true },
    });
    console.log(`Created user: ${user.email} (ID: ${user.id})`);
  } else {
    console.log(`Found existing user: ${user.email} (ID: ${user.id})`);
    
    // Ensure GitHub link exists
    if (!user.githubLink) {
      await prisma.githubLink.create({
        data: {
          userId: user.id,
          githubId: 123456,
          githubType: 'user',
          githubUrl: 'https://github.com/Trynax',
        },
      });
      console.log('✅ Added GitHub link for Trynax');
    }
  }

  // Create or get test app
  const testAppName = 'Test Template Referral App';
  let app = await prisma.echoApp.findFirst({
    where: { name: testAppName },
    include: { appMemberships: true },
  });

  if (!app) {
    console.log('\nCreating test app...');
    app = await prisma.echoApp.create({
      data: {
        name: testAppName,
        appMemberships: {
          create: {
            userId: user.id,
            role: 'OWNER',
            totalSpent: 0,
          },
        },
      },
      include: { appMemberships: true },
    });
    console.log(`Created app: ${app.name} (ID: ${app.id})`);
  } else {
    console.log(`\nFound existing app: ${app.name} (ID: ${app.id})`);
  }

  console.log('\nTest Data Summary:');
  console.log('─────────────────────────────────────────────────────');
  console.log(`User ID:        ${user.id}`);
  console.log(`User Email:     ${user.email}`);
  console.log(`GitHub URL:     ${user.githubLink?.githubUrl || 'https://github.com/Trynax'}`);
  console.log(`App ID:         ${app.id}`);
  console.log(`App Name:       ${app.name}`);
  console.log('─────────────────────────────────────────────────────');
  
  console.log('\nTest Command:');
  console.log(`cd /tmp && /root/developments/opensource/echo/packages/sdk/echo-start/dist/index.js \\`);
  console.log(`  --template https://github.com/Trynax/commitcraft \\`);
  console.log(`  --app-id ${app.id} \\`);
  console.log(`  test-echo-local\n`);
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
