import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./config/test-config.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@config': resolve(__dirname, './config'),
      '@utils': resolve(__dirname, './utils'),
      '@tests': resolve(__dirname, './tests'),
      '@prisma/client': resolve(
        __dirname,
        '../../app/control/src/generated/prisma'
      ),
      '@merit-systems/echo-typescript-sdk': resolve(
        __dirname,
        '../../sdk/ts/src/index.ts'
      ),
    },
  },
});
