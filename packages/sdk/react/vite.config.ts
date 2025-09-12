import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react({
      // Use React 18 JSX runtime to ensure compatibility
      jsxRuntime: 'automatic',
    }),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EchoReactSDK',
      formats: ['es', 'cjs', 'umd'],
      fileName: format => {
        switch (format) {
          case 'es':
            return 'index.js';
          case 'cjs':
            return 'index.cjs';
          case 'umd':
            return 'echo-react-sdk.umd.js';
          default:
            return `index.${format}.js`;
        }
      },
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'openai',
        // Node.js modules that should not be bundled for browser
        'inquirer',
        'commander',
        'chalk',
        'open',
        'fs',
        'path',
        'child_process',
        'os',
        'util',
        'stream',
        'readline',
        'tty',
        'crypto',
        'assert',
        'events',
        // Node.js built-in modules
        /^node:/,
        // CLI helper functions from echo-typescript-sdk
        /@merit-systems\/echo-typescript-sdk.*cli/,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'react/jsx-dev-runtime': 'jsxDevRuntime',
          openai: 'OpenAI',
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
  },
  esbuild: {
    target: 'es2020',
    // Ensure JSX runtime is preserved as external
    jsx: 'preserve',
  },

  optimizeDeps: {
    exclude: ['@merit-systems/echo-typescript-sdk'],
  },
});
