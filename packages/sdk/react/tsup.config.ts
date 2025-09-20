import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'openai',
    'swr',
    '@ai-sdk/react',
    'ai',
    'react-oidc-context',
    'oidc-client-ts',
    'jsdom',
  ],
  splitting: false,
  bundle: true,
});
