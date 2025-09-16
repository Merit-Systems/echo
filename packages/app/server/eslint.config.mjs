import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    name: 'echo-server/ts-base',
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: '.',
      },
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
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    name: 'echo-server/tests',
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    name: 'echo-server/ignores',
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '**/*.d.ts',
    ],
  },
]; 