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
      'import/no-unresolved': ['error', { ignore: ['^core/', '^shell/', '^pages/', '^static/'] }],

      // General style rules
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Purity rules for core/
  {
    files: ['src/core/**/*.js'],
    ignores: ['src/core/**/*.spec.js', 'src/core/**/__test__/**'],
    rules: {
      'no-console': 'error',
      'no-restricted-globals': ['error',
        'browser', 'chrome', 'document', 'window', 'navigator', 'location',
        'localStorage', 'sessionStorage', 'setTimeout', 'setInterval',
        'requestAnimationFrame', 'fetch'],
      'no-restricted-properties': ['error',
        { object: 'Date', property: 'now' },
        { object: 'Math', property: 'random' }],
      'no-restricted-syntax': ['error', {
        selector: 'Program > VariableDeclaration[kind="let"]',
        message: 'No module-level mutable state in core/. Move it to shell/.',
      }],
      'no-restricted-imports': ['error', { paths: [
        'webextension-polyfill', 'debounce', 'redux-persist', 'redux-logger',
      ] }],
    },
  },
  // Layer direction: pages -> shell -> core, and no page imports another
  {
    files: ['src/**/*.js'],
    rules: {
      'import/no-restricted-paths': ['error', { zones: [
        { target: './src/core', from: './src/shell', message: 'core/ must stay pure' },
        { target: './src/core', from: './src/pages', message: 'core/ must stay pure' },
        { target: './src/shell', from: './src/pages', message: 'shell/ must not depend on a page' },
        { target: './src/pages/popup', from: ['./src/pages/settings', './src/pages/background'] },
        { target: './src/pages/settings', from: ['./src/pages/popup', './src/pages/background'] },
        { target: './src/pages/background', from: ['./src/pages/popup', './src/pages/settings'] },
      ] }],
    },
  },
  // Test file overrides
  {
    files: ['src/**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.node,
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
