import { baseConfig } from '../../eslint.config.mjs';
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...baseConfig,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    name: 'next-sdk-example/example-rules',
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off', // Allow console in examples
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in examples
    },
  },
];
