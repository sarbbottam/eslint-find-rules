const plugin = require('eslint-plugin-duplicate-plugin');

module.exports = [{
  plugins: {
    plugin
  },
  rules: {
    "foo-rule": [2],
    "plugin/duplicate-bar-rule": [2],
  }
}];
