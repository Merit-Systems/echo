import { PrismaClient } from '../../../app/control/src/generated/prisma/index.js';
import { TEST_CONFIG } from '../config/index.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: TEST_CONFIG.database.url,
    },
  },
});

export async function resetIntegrationDatabase() {
  console.log('🗑️  Resetting integration test database...');

  try {
    // Clean all data in reverse dependency order
    await prisma.refreshToken.deleteMany();
    await prisma.llmTransaction.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.echoApp.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Integration test database reset successfully');
  } catch (error) {
    console.error('❌ Error resetting integration test database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Auto-run when called directly
if (typeof require !== 'undefined' && require.main === module) {
  resetIntegrationDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
