import { PrismaClient } from '../../echo-control/src/generated/prisma/index.js';
import { TEST_CONFIG, TEST_DATA } from '../config/index.js';

async function verifyCreditGrants() {
  console.log('🔍 Verifying credit grants in integration test database...');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: TEST_CONFIG.database.url,
      },
    },
  });

  try {
    // Get the test user
    const testUser = await prisma.user.findUnique({
      where: { id: TEST_DATA.users.primary.id },
    });

    if (!testUser) {
      console.error('❌ Test user not found');
      return;
    }

    console.log(`✅ Found test user: ${testUser.email}`);

    // Get all credit grants for the test user
    const creditGrants = await prisma.creditGrant.findMany({
      where: { userId: testUser.id },
      include: {
        payment: true,
        transaction: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`\n📊 Found ${creditGrants.length} credit grants:`);

    for (const grant of creditGrants) {
      console.log(`\n💰 Credit Grant: ${grant.id}`);
      console.log(`  Type: ${grant.type}`);
      console.log(`  Amount: $${grant.amount}`);
      console.log(`  Source: ${grant.source}`);
      console.log(`  Description: ${grant.description}`);
      console.log(`  Active: ${grant.isActive}`);

      if (grant.payment) {
        console.log(
          `  🔗 Linked to payment: ${grant.payment.id} ($${grant.payment.amount})`
        );
      }

      if (grant.transaction) {
        console.log(
          `  🔗 Linked to transaction: ${grant.transaction.id} ($${grant.transaction.cost})`
        );
      }
    }

    // Calculate balance
    const credits = creditGrants
      .filter(g => g.type === 'credit' && g.isActive)
      .reduce((sum, g) => sum + Number(g.amount), 0);

    const debits = creditGrants
      .filter(g => g.type === 'debit' && g.isActive)
      .reduce((sum, g) => sum + Number(g.amount), 0);

    const balance = credits - debits;

    console.log(`\n💳 Balance Summary:`);
    console.log(`  Total Credits: $${credits.toFixed(2)}`);
    console.log(`  Total Debits: $${debits.toFixed(2)}`);
    console.log(`  Current Balance: $${balance.toFixed(2)}`);

    console.log('\n✅ Credit grants verification completed successfully');
  } catch (error) {
    console.error('❌ Error verifying credit grants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Auto-run when called directly
if (typeof require !== 'undefined' && require.main === module) {
  verifyCreditGrants()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
