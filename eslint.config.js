const js = require('@eslint/js');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        process: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          paths: ['src', 'node_modules'],
        },
      },
    },
    rules: {
      // Relaxed rules from original airbnb-base config
      'no-use-before-define': 'off',
      'no-fallthrough': 'off',
      'no-param-reassign': 'off',
      'no-underscore-dangle': 'off',
      'prefer-arrow-callback': 'off',

      // Import rules
      'import/prefer-default-export': 'off',
      'import/no-unresolved': ['error', { ignore: ['^core/', '^static/'] }],

      // General style rules
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Test file overrides
  {
    files: ['src/**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        expect: 'readonly',
      },
    },
    rules: {
      'prefer-arrow-callback': 'off',
      'func-names': 'off',
      'prefer-template': 'off',
      'no-plusplus': 'off',
      'no-unused-expressions': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  // Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', 'src/static/**', 'src/patch/**'],
  },
];
