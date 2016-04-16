var path = require('path')
var fs = require('fs')

var eslint = require('eslint')
var isAbsolute = require('path-is-absolute')
var difference = require('./array-diff')
var getSortedRules = require('./sort-rules')

function _getConfigFile(specifiedFile) {
  if (specifiedFile) {
    if (isAbsolute(specifiedFile)) {
      return specifiedFile
    } else {
      return path.join(process.cwd(), specifiedFile)
    }
  } else {
    // this is not being called with an arg. Use the package.json `main`
    return require(path.join(process.cwd(), 'package.json')).main
  }
}

function _getConfig(configFile) {
  var cliEngine = new eslint.CLIEngine({
    // ignore any config applicable depending on the location on the filesystem
    useEslintrc: false,
    // point to the particular config
    configFile: configFile, // eslint-disable-line object-shorthand
  })
  return cliEngine.getConfigForFile()
}

function _getCurrentRules(config) {
  return Object.keys(config.rules)
}

function _getPluginRules(config) {
  var pluginRules = []
  var plugins = config.plugins
  if (plugins) {
    plugins.forEach(function getPluginRule(plugin) {
      var pluginConfig = require('eslint-plugin-' + plugin)
      var rules = pluginConfig.rules
      pluginRules = pluginRules.concat(
        Object.keys(rules).map(function normalizePluginRule(rule) {
          return plugin + '/' + rule
        })
      )
    })
  }
  return pluginRules
}

function _getAllAvailableRules(pluginRules) {
  var allRules = fs
    .readdirSync('./node_modules/eslint/lib/rules')
    .map(function removeJsFromFilename(filename) {
      return filename.replace(/\.js$/, '')
    })

  allRules = allRules.concat(pluginRules)

  return allRules
}

function RuleFinder(specifiedFile) {
  var configFile = _getConfigFile(specifiedFile)
  var config = _getConfig(configFile)
  var currentRules = _getCurrentRules(config)
  var pluginRules = _getPluginRules(config)
  var allRules = _getAllAvailableRules(pluginRules)
  var unusedRules = difference(allRules, currentRules)

  // get all the current rules instead of referring the extended files or documentation
  this.getCurrentRules = function getCurrentRules() {
    return getSortedRules(currentRules)
  }

  // get all the current rules' particular configuration
  this.getCurrentRulesDetailed = function getCurrentRulesDetailed() {
    return config.rules
  }

  // get all the plugin rules instead of referring the extended files or documentation
  this.getPluginRules = function getPluginRules() {
    return getSortedRules(pluginRules)
  }

  // get all the available rules instead of referring eslint and plugin packages or documentation
  this.getAllAvailableRules = function getAllAvailableRules() {
    return getSortedRules(allRules)
  }

  this.getUnusedRules = function getUnusedRules() {
    return getSortedRules(unusedRules)
  }

}

module.exports = function getRuleFinder(specifiedFile) {
  return new RuleFinder(specifiedFile)
}
