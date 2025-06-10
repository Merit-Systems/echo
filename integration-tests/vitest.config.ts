import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node', // Default to Node.js for OAuth tests
    setupFiles: ['./config/test-config.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    // Per-file environment configuration
    environmentMatchGlobs: [
      // React SDK tests need jsdom (browser-like environment)
      ['tests/react-sdk/**', 'jsdom'],
      // OAuth protocol tests need node environment for crypto
      ['tests/oauth-protocol/**', 'node'],
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@config': resolve(__dirname, './config'),
      '@utils': resolve(__dirname, './utils'),
      '@tests': resolve(__dirname, './tests'),
      '@prisma/client': resolve(
        __dirname,
        '../echo-control/src/generated/prisma'
      ),
    },
  },
});
