const globals = require('globals');
const js = require('@eslint/js')
const json = require('eslint-plugin-json');

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
  },
  {
    ignores: ['node_modules/**', 'coverage/**', '.nyc_output/**', 'dist/**']
  },
  {
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.es2015,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 2018,
      },
    },
  },
  {
    files: ['**/*.json'],
    ...json.configs['recommended']
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    }
  }
];