const eslintYml = require('./eslint_yml');
const plugin = require('eslint-plugin-plugin');
const scopeEslintPluginScopedPlugin = require('@scope/eslint-plugin-scoped-plugin');
const scope = require('@scope/eslint-plugin');
const scopeWithDashEslintPluginScopedWithDashPlugin = require('@scope-with-dash/eslint-plugin-scoped-with-dash-plugin');
const scopeWithDash = require('@scope-with-dash/eslint-plugin');

module.exports = [
  eslintYml,
  {
    plugins: {
      plugin,
      '@scope/scoped-plugin': scopeEslintPluginScopedPlugin,
      '@scope': scope,
      '@scope-with-dash/scoped-with-dash-plugin': scopeWithDashEslintPluginScopedWithDashPlugin,
      '@scope-with-dash': scopeWithDash
    },
    rules: {
      '@scope/scoped-plugin/foo-rule': [2],
      '@scope/foo-rule': [2],

      '@scope-with-dash/scoped-with-dash-plugin/foo-rule': [2],
      '@scope-with-dash/foo-rule': [2]
    }
  }
];
