import { baseConfig } from '../eslint.config.mjs';
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

export default [
  ...baseConfig,
  {
    name: 'echo-react-sdk/react-rules',
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        // Browser globals for React components
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        alert: 'readonly',
        URL: 'readonly',
        require: 'readonly',
        NodeJS: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    rules: {
      'no-console': 'warn', // Allow but warn for console in React components
    },
  },
  {
    name: 'echo-react-sdk/test-rules',
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
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
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
      'no-console': 'off', // Allow console in tests
    },
  },
  ...storybook.configs['flat/recommended'],
];