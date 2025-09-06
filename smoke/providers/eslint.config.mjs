import { baseConfig } from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    name: 'smoke-providers/node-rules',
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
      },
    },
    rules: {
      'no-console': 'off', // Allow console in smoke tests
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in smoke tests
    },
  },
];