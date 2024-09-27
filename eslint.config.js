const globals = require('globals');
const js = require('@eslint/js')
const json = require('eslint-plugin-json');

module.exports = [
  {
    files: [
      "**/*.js",
      "**/*.mjs",
      "**/*.cjs",
    ],
    ...js.configs.recommended,

    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.es2015,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 2022,
      },
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      '.nyc_output/**',
      'dist/**',
    ],
  },
  {
    files: ['**/*.json'],
    ...json.configs.recommended,
  },
];
