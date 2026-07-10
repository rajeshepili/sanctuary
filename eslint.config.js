//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [
  ...tanstackConfig,
  ...pluginQuery.configs['flat/recommended-strict'],
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@tanstack/query/prefer-query-options': 'warn',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    files: ['src/components/ui/**'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'no-shadow': 'off',
    },
  },
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'main.js',
      'scripts/**',
      'dist/**',
      'dist-electron/**',
      '**/*.integration.test.ts',
    ],
  },
]
