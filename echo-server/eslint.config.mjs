import { baseConfig } from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    name: 'echo-server/node-globals',
    files: ['**/*.{ts,js}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        Response: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        ReadableStreamDefaultReader: 'readonly',
        NodeJS: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in server code
    },
  },
  {
    name: 'echo-server/tests',
    files: ['**/__tests__/**/*.{ts,js}', '**/*.test.{ts,js}', '**/*.spec.{ts,js}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly', // Vitest global
        vitest: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Relax in tests
    },
  },
]; 