#!/usr/bin/env node

'use strict';
const options = {
  getCurrentRules: ['current', 'c'],
  getPluginRules: ['plugin', 'p'],
  getAllAvailableRules: ['all-available', 'a'],
  getUnusedRules: ['unused', 'u'],
  getDeprecatedRules: ['deprecated', 'd'],
  n: [],
  error: ['error'],
  core: ['core'],
  verbose: ['verbose', 'v'],
  flatConfig: ['flatConfig']
};
const optionsThatError = ['getUnusedRules', 'getDeprecatedRules'];

const argv = require('yargs')
  .boolean(Object.keys(options))
  .alias(options)
  .option('include', {
    alias: 'i',
    choices: ['deprecated'],
    type: 'string'
  })
  .option('ext', {
    type: 'array',
    default: ['.js']
  })
  .default('error', true)
  .default('core', true)
  .default('flatConfig', false)
  .argv;
const getRuleURI = require('eslint-rule-documentation');
const getRuleFinder = require('../lib/rule-finder');
const cli = require('../lib/cli-util');

(async function () {

const specifiedFile = argv._[0];
const finderOptions = {
  omitCore: !argv.core,
  includeDeprecated: argv.include === 'deprecated',
  ext: argv.ext,
  useFlatConfig: argv.flatConfig
};
const ruleFinder = await getRuleFinder(specifiedFile, finderOptions);
const errorOut = argv.error && !argv.n;
let processExitCode = 0;

if (!argv.c && !argv.p && !argv.a && !argv.u && !argv.d) {
  console.log('no option provided, please provide a valid option');
  console.log('usage:');
  console.log('eslint-find-rules [option] <file> [flag]');
} else {
  Object.keys(options).forEach(option => {
    let rules;
    const ruleFinderMethod = ruleFinder[option];
    if (argv[option] && ruleFinderMethod) {
      rules = ruleFinderMethod();
      if (argv.verbose) {
        cli.push('\n' + options[option][0] + ' rules\n' + rules.length + ' rules found\n');
      }
      if (rules.length > 0) {
        if (argv.verbose) {
          rules = rules
            .map(rule => [rule, getRuleURI(rule).url])
            .reduce((all, single) => all.concat(single));
          cli.push(rules, 2, false);
        } else {
          cli.push('\n' + options[option][0] + ' rules\n');
          cli.push(rules);
        }
        if (errorOut && optionsThatError.indexOf(option) !== -1) {
          processExitCode = 1;
        }
      }
    }
  });

  cli.write();
}
process.exit(processExitCode);

})().catch(/* istanbul ignore next */(e) => {
  console.error(e);
  process.exit(1);
});
