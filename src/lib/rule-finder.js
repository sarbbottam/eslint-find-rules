const path = require('path');

const eslint = require('eslint');
const isAbsolute = require('path-is-absolute');
const difference = require('./array-diff');
const getSortedRules = require('./sort-rules');

function _getConfigFile(specifiedFile) {
  if (specifiedFile) {
    if (isAbsolute(specifiedFile)) {
      return specifiedFile;
    }
    return path.join(process.cwd(), specifiedFile); // eslint-disable-line import/no-dynamic-require
  }
  // This is not being called with an arg. Use the package.json `main`
  return require(path.join(process.cwd(), 'package.json')).main; // eslint-disable-line import/no-dynamic-require
}

function _getConfig(configFile) {
  const cliEngine = new eslint.CLIEngine({
    // Ignore any config applicable depending on the location on the filesystem
    useEslintrc: false,
    // Point to the particular config
    configFile
  });
  return cliEngine.getConfigForFile(configFile);
}

function _getCurrentNamesRules(config) {
  return Object.keys(config.rules);
}

function _normalizePluginName(name) {
  const scopedRegex = /(@[^/]+)(\/(.+))?/;
  const match = scopedRegex.exec(name);

  /* istanbul ignore if: cannot test this branch in eslint <5  */
  if (match) {
    if (match[3]) {
      // @scoped/name => @scope/eslint-plugin-name
      return {
        module: `${match[1]}/eslint-plugin-${match[3]}`,
        prefix: `${match[1]}/${match[3]}`
      };
    }

    // @scoped => @scope/eslint-plugin
    return {
      module: `${match[1]}/eslint-plugin`,
      prefix: match[1]
    };
  }

  // Name => eslint-plugin-name
  return {
    module: `eslint-plugin-${name}`,
    prefix: name
  };
}

function _isDeprecated(rule) {
  return rule && rule.meta && rule.meta.deprecated;
}

function _notDeprecated(rule) {
  return !_isDeprecated(rule);
}

function _getPluginRules(config) {
  const pluginRules = new Map();
  const plugins = config.plugins;
  if (plugins) {
    plugins.forEach(plugin => {
      const normalized = _normalizePluginName(plugin);
      const pluginConfig = require(normalized.module);  // eslint-disable-line import/no-dynamic-require
      const rules = pluginConfig.rules === undefined ? {} : pluginConfig.rules;

      Object.keys(rules).forEach(ruleName =>
        pluginRules.set(`${normalized.prefix}/${ruleName}`, rules[ruleName])
      );
    });
  }
  return pluginRules;
}

function _getCoreRules() {
  return eslint.linter.getRules();
}

function _filterRuleNames(ruleNames, rules, predicate) {
  return ruleNames.filter(ruleName => predicate(rules.get(ruleName)));
}

function _isNotCore(rule) {
  return rule.indexOf('/') !== '-1';
}

function RuleFinder(specifiedFile, options) {
  const {omitCore, includeDeprecated} = options;
  const configFile = _getConfigFile(specifiedFile);
  const config = _getConfig(configFile);
  let currentRuleNames = _getCurrentNamesRules(config);
  if (omitCore) {
    currentRuleNames = currentRuleNames.filter(_isNotCore);
  }

  const pluginRules = _getPluginRules(config); // eslint-disable-line vars-on-top
  const coreRules = _getCoreRules();
  const allRules = omitCore ? pluginRules : new Map([...coreRules, ...pluginRules]);

  let allRuleNames = [...allRules.keys()];
  let pluginRuleNames = [...pluginRules.keys()];
  if (!includeDeprecated) {
    allRuleNames = _filterRuleNames(allRuleNames, allRules, _notDeprecated);
    pluginRuleNames = _filterRuleNames(pluginRuleNames, pluginRules, _notDeprecated);
  }
  const deprecatedRuleNames = _filterRuleNames(currentRuleNames, allRules, _isDeprecated);
  const dedupedRuleNames = [...new Set(allRuleNames)];
  const unusedRuleNames = difference(dedupedRuleNames, currentRuleNames);

  // Get all the current rules instead of referring the extended files or documentation
  this.getCurrentRules = () => getSortedRules(currentRuleNames);

  // Get all the current rules' particular configuration
  this.getCurrentRulesDetailed = () => config.rules;

  // Get all the plugin rules instead of referring the extended files or documentation
  this.getPluginRules = () => getSortedRules(pluginRuleNames);

  // Get all the available rules instead of referring eslint and plugin packages or documentation
  this.getAllAvailableRules = () => getSortedRules(dedupedRuleNames);

  this.getUnusedRules = () => getSortedRules(unusedRuleNames);

  // Get all the current rules that are deprecated
  this.getDeprecatedRules = () => getSortedRules(deprecatedRuleNames);
}

module.exports = function (specifiedFile, options = {}) {
  return new RuleFinder(specifiedFile, options);
};
