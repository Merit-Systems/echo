// This file is now deprecated - environment loading is handled by config/test-config.ts
// Keep for backward compatibility until all references are updated

import { TEST_CONFIG } from '../config/index.js';

export function loadIntegrationTestEnv() {
  console.log('🔧 Loading integration test environment (via TEST_CONFIG)...');

  console.log('✅ All required environment variables loaded');
  console.log(`🎯 Echo Control URL: ${TEST_CONFIG.services.echoControl}`);
  console.log(
    `🗄️  Database: ${TEST_CONFIG.database.host}:${TEST_CONFIG.database.port}/${TEST_CONFIG.database.name}`
  );
}

// Auto-load when imported for backward compatibility
loadIntegrationTestEnv();
