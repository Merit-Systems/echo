import { baseConfig } from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    name: 'integration-tests/test-rules',
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        // Test globals
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
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        RequestInit: 'readonly',
        // Browser globals for browser testing
        window: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in test files
      'no-console': 'off', // Allow console in tests
      'no-debugger': 'warn', // Warn instead of error in tests
    },
  },
];