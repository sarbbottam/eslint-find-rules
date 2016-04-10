# eslint-rule-finder

[![Join the chat at https://gitter.im/sarbbottam/eslint-rule-finder](https://badges.gitter.im/sarbbottam/eslint-rule-finder.svg)](https://gitter.im/sarbbottam/eslint-rule-finder?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Use this for your own [ESLint](http://eslint.org/) [shareable configuration](http://eslint.org/docs/developer-guide/shareable-configs)
to list current configured rules, all-available rules, unused rules, and plugin rules.

[![Build Status](https://img.shields.io/travis/sarbbottam/eslint-rule-finder.svg?style=flat-square)](https://travis-ci.org/sarbbottam/eslint-rule-finder)
[![Code Coverage](https://img.shields.io/codecov/c/github/sarbbottam/eslint-rule-finder.svg?style=flat-square)](https://codecov.io/github/sarbbottam/eslint-rule-finder)
[![version](https://img.shields.io/npm/v/eslint-rule-finder.svg?style=flat-square)](http://npm.im/eslint-rule-finder)
[![downloads](https://img.shields.io/npm/dm/eslint-rule-finder.svg?style=flat-square)](http://npm-stat.com/charts.html?package=eslint-rule-finder&from=2015-08-01)
[![MIT License](https://img.shields.io/npm/l/eslint-rule-finder.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors)

## Acknowledgement

This module is an extended version of [eslint-find-new-rules](https://github.com/kentcdodds/eslint-find-new-rules)

## Installation

Simply install locally as a development dependency to your project's package:

```
npm install --save-dev eslint-rule-finder
```

## Usage

The intended usage is as an npm script:

```javascript
{
  ...
  "scripts": {
    "eslint-find-option-rules": "eslint-rule-finder [option] <file>"
  }
  ...
}
```

```
available options are -c|--current, -a|--all-available, -p|--plugin, -u|--unused
```
Then run it with: `$ npm run eslint-find-option-rules -s` (the `-s` is to silence npm output).

### Specify a file

This is really handy in an actual config module (like [eslint-config-kentcdodds](https://github.com/kentcdodds/eslint-config-kentcdodds)) where you could also do:

```
// available options are -c|--current, -a|--all-available, -p|--plugin, -u|--unused
eslint-rule-finder --option ./index.js
```

This is resolved, relative to the `process.cwd()` which, in the context of `npm` scripts is always the location of your `package.json`.

You may specify any [config format supported by ESLint](http://eslint.org/docs/user-guide/configuring).

### Absolute Path

You can also provide an absolute path:

```
eslint-rule-finder --option ~/Developer/eslint-config-kentcdodds/index.js
```

**Please note** that any tested ESLint config file must reside below your project's root.

### Default to `main`

It will also default to the `main` in your `package.json`, so you can omit the `path/to/file` argument:

```
eslint-rule-finder --option
```

### As a `require`d module

```
var getRuleFinder = require('./eslint-rule-finder')
var ruleFinder = getRuleFinder('path/to/eslint-config')

// default to the `main` in your `package.json`
// var ruleFinder = getRuleFinder()

// get all the current, plugin, available and unused rules
// without referring the extended files or documentation

ruleFinder.getCurrentRules()

ruleFinder.getPluginRules()

ruleFinder.getAllAvailableRules()

ruleFinder.getUnusedRules()
```

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [![Kent C. Dodds](https://avatars3.githubusercontent.com/u/1500684?v=3&s=100)<br /><sub>Kent C. Dodds</sub>](https://twitter.com/kentcdodds)<br />[💻](https://github.com/kentcdodds/eslint-find-new-rules/commits?author=kentcdodds) [📖](https://github.com/kentcdodds/eslint-find-new-rules/commits?author=kentcdodds) [⚠️](https://github.com/kentcdodds/eslint-find-new-rules/commits?author=kentcdodds) 👀 | [![Michał Gołębiowski](https://avatars3.githubusercontent.com/u/1758366?v=3&s=100)<br /><sub>Michał Gołębiowski</sub>](https://github.com/mgol)<br />[💻](https://github.com/kentcdodds/eslint-find-new-rules/commits?author=mgol) | [![Sarbbottam Bandyopadhyay](https://avatars1.githubusercontent.com/u/949380?v=3&s=100)<br /><sub>Sarbbottam Bandyopadhyay</sub>](https://twitter.com/sarbbottam)<br />[⚠️](https://github.com/kentcdodds/eslint-find-new-rules/commits?author=sarbbottam) 👀 | [![Andreas Windt](https://avatars1.githubusercontent.com/u/262436?v=3&s=100)<br /><sub>Andreas Windt</sub>](https://twitter.com/ta2edchimp)<br />[💻](https://github.com/kentcdodds/eslint-find-new-rules/commits?author=ta2edchimp) [📖](https://github.com/kentcdodds/eslint-find-new-rules/commits?author=ta2edchimp) [⚠️](https://github.com/kentcdodds/eslint-find-new-rules/commits?author=ta2edchimp) | [![Jeroen Engels](https://avatars.githubusercontent.com/u/3869412?v=3&s=100)<br /><sub>Jeroen Engels</sub>](https://github.com/jfmengels)<br />[📖](https://github.com/kentcdodds/eslint-find-new-rules/commits?author=jfmengels) |
| :---: | :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.
Contributions of any kind welcome!

Special thanks to [@mgol](https://github.com/mgol) who created the original script.

## LICENSE

MIT
