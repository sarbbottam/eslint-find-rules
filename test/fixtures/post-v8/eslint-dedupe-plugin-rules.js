const eslintrc = require('./eslintrc');
const merge = require('lodash/merge');
const plugin = require('eslint-plugin-plugin');

module.exports = merge(eslintrc, {
  plugins: {
    plugin
  },
  rules: {
    "plugin/duplicate-bar-rule": [2]
  }
});
