import { baseConfig } from '../eslint.config.mjs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...baseConfig,
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    name: 'echo-control/react-rules',
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-console': 'warn', // Allow but warn for console in client code
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    name: 'echo-control/ignores',
    ignores: [
      'src/generated/**',
      'prisma/generated/**',
      '.source/**',
      'public/**',
    ],
  },
];
