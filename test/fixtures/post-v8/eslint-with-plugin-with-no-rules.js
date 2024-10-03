const plugin = require('eslint-plugin-plugin');
const eslintPluginNoRules = require('eslint-plugin-no-rules');

module.exports = {
  plugins: {
    plugin,
    'no-rules': eslintPluginNoRules
  },
  rules: {}
}
