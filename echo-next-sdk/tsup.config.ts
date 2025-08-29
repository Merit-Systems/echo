import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/client.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  external: [
    'react',
    'react-dom',
    'next',
    'next/navigation',
    'next/headers',
    'axios',
  ],
  splitting: false,
  bundle: true,
});
