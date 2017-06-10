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
  return cliEngine.getConfigForFile();
}

function _getCurrentRules(config) {
  return Object.keys(config.rules);
}

function _normalizePluginName(name) {
  const scopedRegex = /(@[^/]+)\/(.+)/;
  const match = scopedRegex.exec(name);

  if (match) {
    return {
      module: `${match[1]}/eslint-plugin-${match[2]}`,
      prefix: match[2]
    };
  }

  return {
    module: `eslint-plugin-${name}`,
    prefix: name
  };
}

function _getPluginRules(config) {
  let pluginRules = [];
  const plugins = config.plugins;
  if (plugins) {
    plugins.forEach(plugin => {
      const normalized = _normalizePluginName(plugin);
      const pluginConfig = require(normalized.module);  // eslint-disable-line import/no-dynamic-require

      const rules = pluginConfig.rules === undefined ? {} : pluginConfig.rules;
      pluginRules = pluginRules.concat(
        Object.keys(rules).map(rule => {
          return normalized.prefix + '/' + rule;
        })
      );
    });
  }
  return pluginRules;
}

function _getAllAvailableRules(pluginRules) {
  return [
    ...eslint.linter.getRules().keys(),
    ...pluginRules
  ];
}

function _isNotCore(rule) {
  return rule.indexOf('/') !== '-1';
}

function RuleFinder(specifiedFile, noCore) {
  const configFile = _getConfigFile(specifiedFile);
  const config = _getConfig(configFile);
  let currentRules = _getCurrentRules(config);
  const pluginRules = _getPluginRules(config);
  const allRules = noCore ? pluginRules : _getAllAvailableRules(pluginRules);
  if (noCore) {
    currentRules = currentRules.filter(_isNotCore);
  }
  const unusedRules = difference(allRules, currentRules); // eslint-disable-line vars-on-top

  // Get all the current rules instead of referring the extended files or documentation
  this.getCurrentRules = () => getSortedRules(currentRules);

  // Get all the current rules' particular configuration
  this.getCurrentRulesDetailed = () => config.rules;

  // Get all the plugin rules instead of referring the extended files or documentation
  this.getPluginRules = () => getSortedRules(pluginRules);

  // Get all the available rules instead of referring eslint and plugin packages or documentation
  this.getAllAvailableRules = () => getSortedRules(allRules);

  this.getUnusedRules = () => getSortedRules(unusedRules);
}

module.exports = function (specifiedFile, noCore) {
  return new RuleFinder(specifiedFile, noCore);
};
