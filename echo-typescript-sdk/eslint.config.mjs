import { baseConfig } from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    name: 'echo-typescript-sdk/sdk-rules',
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-console': 'warn', // Allow but warn for console in SDK
      'no-undef': 'off', // TypeScript handles this
    },
  },
];
