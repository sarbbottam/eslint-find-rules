const plugin = require('eslint-plugin-plugin');
const scopeEslintPluginScopedPlugin = require('@scope/eslint-plugin-scoped-plugin');
const scope = require('@scope/eslint-plugin');
const scopeWithDashEslintPluginScopedWithDashPlugin = require('@scope-with-dash/eslint-plugin-scoped-with-dash-plugin');
const scopeWithDash = require('@scope-with-dash/eslint-plugin');

module.exports = [
  {
    plugins: {
      plugin,
    },
    rules: {
      "foo-rule": [2],
      "old-rule": [2],

      "plugin/old-plugin-rule": [2]
    },
  },
  {
    files: ["**/*.json"],
    plugins: {
      '@scope/scoped-plugin': scopeEslintPluginScopedPlugin,
      '@scope': scope,
    },
    rules: {
      "@scope/scoped-plugin/foo-rule": [2],
      "@scope/foo-rule": [2]
    }
  },
  {
    files: ["**/*.txt"],
    plugins: {
      '@scope-with-dash/scoped-with-dash-plugin': scopeWithDashEslintPluginScopedWithDashPlugin,
      '@scope-with-dash': scopeWithDash
    },
    rules: {
        "@scope-with-dash/scoped-with-dash-plugin/old-plugin-rule": [2]
    }
  }
];
