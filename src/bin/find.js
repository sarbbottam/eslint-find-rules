#!/usr/bin/env node

'use strict';
const options = {
  getCurrentRules: ['current', 'c'],
  getPluginRules: ['plugin', 'p'],
  getAllAvailableRules: ['all-available', 'a'],
  getUnusedRules: ['unused', 'u'],
  n: [],
  error: ['error'],
  nc: [],
  core: ['core'],
  verbose: ['verbose', 'v']
};

const argv = require('yargs')
  .boolean(Object.keys(options))
  .alias(options)
  .default('error', true)
  .default('core', true)
  .argv;

const getRuleURI = require('eslint-rule-documentation');
const getRuleFinder = require('../lib/rule-finder');
const cli = require('../lib/cli-util');

let processExitCode = argv.u && (!argv.n || argv.error) ? 1 : 0;
const specifiedFile = argv._[0];

const ruleFinder = getRuleFinder(specifiedFile, argv.core === false);

if (!argv.c && !argv.p && !argv.a && !argv.u) {
  console.log('no option provided, please provide a valid option'); // eslint-disable-line no-console
  console.log('usage:'); // eslint-disable-line no-console
  console.log('eslint-find-rules [option] <file> [flag]'); // eslint-disable-line no-console
  process.exit(0);
}

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
        rules = rules.map(rule => {
          return [rule, getRuleURI(rule).url];
        }).reduce((all, single) => {
          return all.concat(single);
        });
        cli.push(rules, 2, false);
      } else {
        cli.push('\n' + options[option][0] + ' rules\n');
        cli.push(rules);
      }
      cli.write();
    } else /* istanbul ignore else */ if (option === 'getUnusedRules') {
      processExitCode = 0;
    }
  }
});

if (processExitCode) {
  process.exit(processExitCode);
}
