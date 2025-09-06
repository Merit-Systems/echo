import { baseConfig } from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    name: 'echo-next-sdk/next-rules',
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
      },
    },
    rules: {
      'no-console': 'warn', // Allow but warn for console in Next.js SDK
      'no-undef': 'off', // TypeScript handles this
    },
  },
];
