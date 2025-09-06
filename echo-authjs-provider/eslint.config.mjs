import { baseConfig } from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    name: 'echo-authjs-provider/provider-rules',
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-console': 'warn', // Allow but warn for console in auth provider
    },
  },
];
