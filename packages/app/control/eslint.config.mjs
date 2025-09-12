import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    name: 'echo-control/ignores',
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'coverage/',
      'public/**',
      'src/generated/**',
      'prisma/generated/**',
      '**/*.d.ts',
      '.source/**',
    ],
  },
];

export default config;
