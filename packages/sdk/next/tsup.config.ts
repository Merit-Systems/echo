import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/client.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  external: [
    'axios',
    'react',
    'react-dom',
    '@merit-systems/echo-react-sdk',
    'swr',
    'ai',
    '@ai-sdk/react',
  ],
  splitting: false,
  bundle: true,
});
