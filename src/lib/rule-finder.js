const path = require('path');

const { ESLint, Linter } = require('eslint');
const { builtinRules } = require('eslint/use-at-your-own-risk');
const glob = require('glob');
const difference = require('./array-diff');
const getSortedRules = require('./sort-rules');
const normalizePluginName = require('./normalize-plugin-name');

function _getConfigFile(specifiedFile) {
  if (specifiedFile) {
    if (path.isAbsolute(specifiedFile)) {
      return specifiedFile;
    }
    return path.join(process.cwd(), specifiedFile);
  }
  // This is not being called with an arg. Use the package.json `main`
  return require(path.join(process.cwd(), 'package.json')).main;
}

async function _getConfigs(overrideConfigFile, files) {
  const eslintOptions = { 
    // Point to the particular config
    overrideConfigFile
  };
  if (ESLint.configType === 'eslintrc') {
    // Ignore any config applicable depending on the location on the filesystem
    eslintOptions.useEslintrc = false;
  }
  const esLint = new ESLint(eslintOptions);
  
  const configs = files.map(async filePath => (
    await esLint.isPathIgnored(filePath) ? false : esLint.calculateConfigForFile(filePath)
  ));
  return new Set((await Promise.all(configs)).filter(Boolean));
}

async function _getConfig(configFile, files) {
  return Array.from(await _getConfigs(configFile, files)).reduce((prev, item) => {
    return Object.assign(prev, item, {
      rules: Object.assign({}, prev.rules, item.rules),
      plugins: ESLint.configType === 'eslintrc'
        ? [...new Set([].concat(prev.plugins || [], item.plugins || []))]
        : Object.assign({}, prev.plugins, item.plugins),
    });
  }, {});
}

function _getCurrentNamesRules(config) {
  return config.rules ? Object.keys(config.rules) : [];
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
  /* istanbul ignore else */
  if (plugins) {
    (ESLint.configType === 'eslintrc' ? plugins : Object.keys(plugins)).forEach(plugin => {
      const normalized = ESLint.configType === 'eslintrc' ? normalizePluginName(plugin) : null;
      const pluginConfig = normalized ? require(normalized.module) : null;
      const rules = pluginConfig ? pluginConfig.rules : plugins[plugin].rules;

      if (rules) {
        Object.keys(rules).forEach(ruleName =>
          pluginRules.set(`${normalized ? normalized.prefix : plugin}/${ruleName}`, rules[ruleName])
        );
      }
    });
  }
  return pluginRules;
}

function _getCoreRules() {
  return ESLint.configType === 'eslintrc' ? new Linter().getRules() : builtinRules;
}

function _filterRuleNames(ruleNames, rules, predicate) {
  return ruleNames.filter(ruleName => predicate(rules.get(ruleName)));
}

function _isNotCore(rule) {
  return rule.indexOf('/') !== '-1';
}

function _escapeRegExp(str) {
  return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

function _createExtensionRegExp(extensions) {
  const normalizedExts = extensions.map(ext => _escapeRegExp(
    ext.startsWith('.') ? ext.slice(1) : ext
  ));

  return new RegExp(`.\\.(?:${normalizedExts.join("|")})$`);
}

function RuleFinder(config, {omitCore, includeDeprecated}) {
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

async function createRuleFinder(specifiedFile, options) {
  const configFile = _getConfigFile(specifiedFile);

  const {ext = ['.js', '.cjs', '.mjs']} = options;
  const extensionRegExp = _createExtensionRegExp(ext);
  const files = glob.sync(`**/*`, {dot: true, matchBase: true})
    .filter(file => extensionRegExp.test(file));

  const config = await _getConfig(configFile, files);

  return new RuleFinder(config, options);
}

module.exports = async function (specifiedFile, options = {}) {
  return createRuleFinder(specifiedFile, options);
};
