import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/security/**/*.test.ts'],
    testTimeout: 15000,
    hookTimeout: 10000,
    reporters: ['verbose'],
  },
});
