import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@merit-systems/echo-typescript-sdk': resolve(__dirname, '../ts/src'),
      'config': resolve(__dirname, '../ts/src/config'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/integration/**/*.test.tsx'],
    testTimeout: 30000,
    hookTimeout: 15000,
    sequence: {
      concurrent: false, // Run integration tests sequentially
    },
  },
});
