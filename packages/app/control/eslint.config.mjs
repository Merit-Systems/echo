import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'dist/**',
      'coverage/**',
      'public/**',
      'src/generated/**',
      'prisma/generated/**',
      '**/*.d.ts',
      '.source/**',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'no-process-env-outside-env': {
        rules: {
          'no-process-env-outside-env': {
            meta: {
              type: 'problem',
              docs: {
                description: 'Disallow process.env usage outside of @/env',
                category: 'Best Practices',
                recommended: true,
              },
              fixable: null,
              schema: [],
              messages: {
                noProcessEnvOutsideEnv:
                  'Direct access to process.env is not allowed. Use the centralized env object from @/env instead.',
              },
            },
            create(context) {
              const filename = context.getFilename();
              const isEnvFile =
                filename.includes('/env.ts') || filename.includes('/env.js');

              // Allow process.env usage in the env.ts file itself
              if (isEnvFile) {
                return {};
              }

              return {
                MemberExpression(node) {
                  // Check if the expression is process.env
                  if (
                    node.object &&
                    node.object.type === 'MemberExpression' &&
                    node.object.object &&
                    node.object.object.type === 'Identifier' &&
                    node.object.object.name === 'process' &&
                    node.object.property &&
                    node.object.property.type === 'Identifier' &&
                    node.object.property.name === 'env'
                  ) {
                    context.report({
                      node,
                      messageId: 'noProcessEnvOutsideEnv',
                    });
                  }
                },
              };
            },
          },
        },
      },
      'no-db-client-outside-db': {
        rules: {
          'no-db-client-outside-db': {
            meta: {
              type: 'problem',
              docs: {
                description:
                  'Disallow @/services/db/client imports outside of @db/ folder',
                category: 'Best Practices',
                recommended: true,
              },
              fixable: null,
              schema: [],
              messages: {
                noDbClientOutsideDb:
                  'Direct imports from @/services/db/client are not allowed outside of the @/services/db/ folder. Create a new service in @/services/db instead.',
              },
            },
            create(context) {
              const filename = context.getFilename();

              // Allow imports within the @db/ folder structure
              const isDbFolderFile = filename.includes('/services/db/');

              // Allow imports in the client.ts file itself
              const isClientFile = filename.includes('/services/db/client.ts');

              if (isDbFolderFile || isClientFile) {
                return {};
              }

              return {
                ImportDeclaration(node) {
                  // Check if the import source is @/services/db/client or relative imports to services/db/client
                  if (
                    node.source &&
                    node.source.type === 'Literal' &&
                    typeof node.source.value === 'string'
                  ) {
                    const importPath = node.source.value;
                    const isDbClientImport =
                      importPath === '@/services/db/client' ||
                      importPath.endsWith('/db/client') ||
                      importPath.endsWith('./services/db/client') ||
                      importPath.endsWith('../services/db/client');

                    if (isDbClientImport) {
                      context.report({
                        node,
                        messageId: 'noDbClientOutsideDb',
                      });
                    }
                  }
                },
              };
            },
          },
        },
      },
    },
    rules: {
      'no-process-env-outside-env/no-process-env-outside-env': 'error',
      'no-db-client-outside-db/no-db-client-outside-db': 'error',
    },
  },
  {
    files: ['docs/mcp-server/**/*.ts'],
    rules: {
      'no-process-env-outside-env/no-process-env-outside-env': 'off',
    },
  }
);
