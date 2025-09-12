import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
