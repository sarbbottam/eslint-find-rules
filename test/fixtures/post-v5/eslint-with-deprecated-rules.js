const plugin = require('eslint-plugin-plugin');
const scopeEslintPluginScopedPlugin = require('@scope/eslint-plugin-scoped-plugin');
const scope = require('@scope');
const scopeWithDashEslintPluginScopedWithDashPlugin = require('@scope-with-dash/eslint-plugin-scoped-with-dash-plugin');
const scopeWithDash = require('@scope-with-dash');

module.exports = {
  plugins: {
    plugin,
    '@scope/scoped-plugin': scopeEslintPluginScopedPlugin,
    '@scope': scope,
    '@scope-with-dash/scoped-with-dash-plugin': scopeWithDashEslintPluginScopedWithDashPlugin,
    '@scope-with-dash': scopeWithDash
  },
  rules: {
    'foo-rule': [2],
    'old-rule': [2],

    'plugin/foo-rule': [2],
    'plugin/old-plugin-rule': [2],

    '@scope/scoped-plugin/foo-rule': [2],
    '@scope/scoped-plugin/old-plugin-rule': [2],

    '@scope/foo-rule': [2],
    '@scope/old-plugin-rule': [2],

    '@scope-with-dash/scoped-with-dash-plugin/foo-rule': [2],
    '@scope-with-dash/scoped-with-dash-plugin/old-plugin-rule': [2],

    '@scope-with-dash/foo-rule': [2],
    '@scope-with-dash/old-plugin-rule': [2]
  }
}
