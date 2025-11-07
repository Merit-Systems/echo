import baseConfig from '../../packages/app/control/eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];

