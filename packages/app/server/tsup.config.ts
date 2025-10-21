import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  dts: false, // Don't generate .d.ts files for server code
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  // Mark all dependencies as external - they'll be in node_modules at runtime
  external: [
    '@coinbase/cdp-sdk',
    '@google-cloud/storage',
    '@google/genai',
    '@coinbase/x402',
    '@merit-systems/echo-typescript-sdk',
    '@opentelemetry',
    '@prisma/client',
    'express',
    'winston',
    'dotenv',
    'cors',
    'compression',
    'multer',
    'openai',
    'viem',
    'uuid',
    'zod',
    'jose',
    'node-fetch',
    'google-auth-library',
    'x402-express',
  ],
  noExternal: [], // Everything else gets bundled
  target: 'node20',
  platform: 'node',
  splitting: false,
  bundle: true,
});
