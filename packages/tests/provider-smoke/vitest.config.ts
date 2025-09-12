import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./load-env.ts'],
    testTimeout: 900000, // 15 minutes
    hookTimeout: 900000,
    teardownTimeout: 900000,
    maxConcurrency: 1000,
    maxWorkers: 20,
  },
  optimizeDeps: {
    exclude: ['@merit-systems/echo-typescript-sdk'],
  },
});
