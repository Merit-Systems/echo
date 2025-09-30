import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    setupFiles: ['src/__tests__/setup.ts'],
    globals: true,
  },
  optimizeDeps: {
    exclude: ['@merit-systems/echo-typescript-sdk'],
  },
});
