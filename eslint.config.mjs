import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '**/dist/**',
    '**/vue-dist/**',
    '**/*.vsix',
    'books/**',
  ],
  stylistic: false,
  typescript: true,
  vue: true,
}, {
  name: 'b-reader/rules',
  rules: {
    'jsdoc/require-returns-description': 'off',
    'jsonc/sort-keys': 'off',
    'node/prefer-global/buffer': 'off',
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-named-exports': 'off',
    'perfectionist/sort-named-imports': 'off',
    'pnpm/yaml-enforce-settings': 'off',
    'regexp/use-ignore-case': 'off',
    'ts/method-signature-style': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'yaml/plain-scalar': 'off',
  },
}, {
  files: ['**/*.test.ts'],
  name: 'b-reader/node-tests',
  rules: {
    'test/no-import-node-test': 'off',
  },
})
