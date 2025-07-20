import js from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import sonarjs from 'eslint-plugin-sonarjs'
import storybook from 'eslint-plugin-storybook'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'storybook-static', 'test-results', 'coverage'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintPluginPrettierRecommended,
      sonarjs.configs.recommended,
    ],
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Use absolute imports like @/components instead of relative paths.',
            },
            {
              group: ['@/services/*/*', './services/*/*'],
              message: 'Use import from index.ts from @/services/* instead of @/services/*/*',
            },
          ],
        },
      ],
      'prettier/prettier': 'error',
      'no-console': 'error',
      'react/jsx-no-literals': 'error',
      'require-await': 'error',
      'no-param-reassign': 'error',
      'no-return-await': 'error',
      'no-redeclare': 'error',
      'no-shadow': 'error',
      'import/no-unresolved': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'no-restricted-globals': [
        'error',
        {
          name: 'chrome',
          message: 'Use browser service abstraction instead of direct chrome global access.',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/services/browser/**/*.ts', 'src/background.ts'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
  {
    files: ['src/utils/html/pure/*.ts'],
    ignores: ['src/utils/html/pure/*.test.ts'],
    rules: {
      'no-console': 'off',
      'no-restricted-syntax': [
        'error',
        {
          // Forbid all import declarations that are not type-only
          selector: "ImportDeclaration:not([importKind='type'])",
          message: 'Only type imports are allowed.',
        },
        {
          // Forbid require() calls
          selector: "CallExpression[callee.name='require']",
          message: 'Require statements are forbidden.',
        },
        {
          // Forbid dynamic import()
          selector: 'ImportExpression',
          message: 'Dynamic imports are forbidden.',
        },
      ],
    },
  },
  storybook.configs['flat/recommended'],
)
