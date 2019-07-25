module.exports = {
  env: {},
  extends: [],
  globals: {},
  overrides: [],
  parserOptions: {
    ecmaFeatures: {
      impliedStrict: true,
    },
    ecmaVersion: 2018,
    parser: 'babel-eslint', // https://github.com/vuejs/eslint-plugin-vue#what-is-the-use-the-latest-vue-eslint-parser-error
    sourceType: 'module',
  },
  plugins: [
    'json',
  ],
  root: true,
  rules: {},
  settings: {
    polyfills: [],
  },
};
