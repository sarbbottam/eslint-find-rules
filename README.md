# eslint-find-rules

[![Join the chat at https://gitter.im/sarbbottam/eslint-find-rules](https://badges.gitter.im/sarbbottam/eslint-find-rules.svg)](https://gitter.im/sarbbottam/eslint-find-rules?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Use this for your own [ESLint](http://eslint.org/) [shareable configuration](http://eslint.org/docs/developer-guide/shareable-configs)
to list current configured rules, all-available rules, unused rules, and plugin rules.

[![Build Status](https://img.shields.io/travis/sarbbottam/eslint-find-rules.svg?style=flat-square)](https://travis-ci.org/sarbbottam/eslint-find-rules)
[![Code Coverage](https://img.shields.io/codecov/c/github/sarbbottam/eslint-find-rules.svg?style=flat-square)](https://codecov.io/github/sarbbottam/eslint-find-rules)
[![version](https://img.shields.io/npm/v/eslint-find-rules.svg?style=flat-square)](http://npm.im/eslint-find-rules)
[![downloads](https://img.shields.io/npm/dm/eslint-find-rules.svg?style=flat-square)](http://npm-stat.com/charts.html?package=eslint-find-rules&from=2015-08-01)
[![MIT License](https://img.shields.io/npm/l/eslint-find-rules.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![All Contributors](https://img.shields.io/badge/all_contributors-10-orange.svg?style=flat-square)](#contributors)

## Acknowledgment

This module is an extended version of [eslint-find-new-rules](https://github.com/kentcdodds/eslint-find-new-rules)

## Installation

Simply install locally as a development dependency to your project's package:

```
npm install --save-dev eslint-find-rules
```

## Usage

> It is expected to be used as `local` utility, as it needs `eslint` and the `eslint-plugins` being referred by the `eslint-config` file, to be installed.
Using it as a `global` utility, will error out, if `eslint` and the `eslint-plugins` being referred by the `eslint-config` file, are not installed globally.

The intended usage is as an npm script:

```javascript
{
  ...
  "scripts": {
    "eslint-find-option-rules": "eslint-find-rules [option] <file> [flag]"
  }
  ...
}
```

Then run it with: `$ npm run --silent eslint-find-option-rules` (the `--silent` is to silence npm output).

```
available options are -a|--all-available, -c|--current, -d|--deprecated, -p|--plugin, -u|--unused
available flags are -n|--no-error, --no-core, -i/--include deprecated, --ext .js, and --flatConfig
```

By default it will error out only for `-d|--deprecated` and `-u|--unused`,
however if you do not want the `process` to `exit` with a `non-zero` exit code, use the `-n|--no-error` flag along with `-d|--deprecated` or `-u|--unused`.

By default, core rules will be included in the output of `-a|--all-available`, `-c|--current`, `-d|--deprecated`, and `-u|--unused`.  If you want to report on plugin rules only, use the `--no-core` flag.

By default, deprecated rules will be omitted from the output of `-a|--all-available`, `-p|--plugin` and `-u|--unused`.  If you want to report on deprecated rules as well, use the `--include=deprecated` or `-i deprecated` flag.

By default, rules will be searched for files having `.js` extension.  If you want to find rules using another extension (`.json` for example), use the `--ext .json` flag (or `--ext .js --ext .json` if you need multiple extensions).

By default, ESLint will handle configs in Legacy mode. If you want to handle Flat config files, you need to add the `--flatConfig` flag.

**NOTE:** Deprecated rules are found by looking at the metadata of the rule definition.  All core rules and many plugin rules use this flag to indicate deprecated rules.  But if you find a plugin that does not mark their rules as deprecated in the rule metadata, please file a pull request with that project.

### Specify a file

This is really handy in an actual config module (like [eslint-config-kentcdodds](https://github.com/kentcdodds/eslint-config-kentcdodds)) where you could also do:

```
// available options are -a|--all-available, -c|--current, -d|--deprecated, -p|--plugin, -u|--unused
eslint-find-rules --option ./index.js
```

This is resolved, relative to the `process.cwd()` which, in the context of `npm` scripts is always the location of your `package.json`.

You may specify any [config format supported by ESLint](http://eslint.org/docs/user-guide/configuring).

### Absolute Path

You can also provide an absolute path:

```
eslint-find-rules --option ~/Developer/eslint-config-kentcdodds/index.js
```

**Please note** that any tested ESLint config file must reside below your project's root.

### Default to `main`

It will also default to the `main` in your `package.json`, so you can omit the `path/to/file` argument:

```
eslint-find-rules --option
```

### As a `require`d module

```
var getRuleFinder = require('./eslint-find-rules')
var ruleFinder = getRuleFinder('path/to/eslint-config')

// default to the `main` in your `package.json`
// var ruleFinder = await getRuleFinder()

// get all the current, plugin, available and unused rules
// without referring the extended files or documentation

ruleFinder.getCurrentRules()

ruleFinder.getCurrentRulesDetailed()

ruleFinder.getPluginRules()

ruleFinder.getAllAvailableRules()

ruleFinder.getUnusedRules()

ruleFinder.getDeprecatedRules()
```

### Log the difference between two config files

```javascript
{
  ...
  "scripts": {
    "eslint-diff-rules": "eslint-diff-rules <file1> <file2>"
  }
  ...
}
```

### ESLint v9 support
By default `eslint-find-rules` uses **Legacy** mode to retrieve the rules with the specified config file. If you want to find rules with a flat config, which is the new default mode in ESLint v9, you need to add the `--flatConfig` flag when running the command.

You'll probably also need to add `--ext .js, .cjs, .mjs` if you're working with one of the new Javascript filename extensions in your project.

<u>**Note:**</u> ESLint v9 support requires a recent version of Node.JS: `^18.18.0 || ^20.9.0 || >=21.1.0`, as mentionned in the [ESLint documentation](https://eslint.org/docs/latest/use/migrate-to-9.0.0#-nodejs--v1818-v19-are-no-longer-supported).

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars1.githubusercontent.com/u/949380?v=3" width="100px;"/><br /><sub><b>Sarbbottam Bandyopadhyay</b></sub>](https://twitter.com/sarbbottam)<br />[💻](https://github.com/sarbbottam/eslint-find-rules/commits?author=sarbbottam "Code") [📖](https://github.com/sarbbottam/eslint-find-rules/commits?author=sarbbottam "Documentation") [⚠️](https://github.com/sarbbottam/eslint-find-rules/commits?author=sarbbottam "Tests") [👀](#review-sarbbottam "Reviewed Pull Requests") | [<img src="https://avatars1.githubusercontent.com/u/262436?v=3" width="100px;"/><br /><sub><b>Andreas Windt</b></sub>](https://twitter.com/ta2edchimp)<br />[💻](https://github.com/sarbbottam/eslint-find-rules/commits?author=ta2edchimp "Code") [📖](https://github.com/sarbbottam/eslint-find-rules/commits?author=ta2edchimp "Documentation") [⚠️](https://github.com/sarbbottam/eslint-find-rules/commits?author=ta2edchimp "Tests") [👀](#review-ta2edchimp "Reviewed Pull Requests") | [<img src="https://avatars3.githubusercontent.com/u/1500684?v=3" width="100px;"/><br /><sub><b>Kent C. Dodds</b></sub>](https://twitter.com/kentcdodds)<br />[💻](https://github.com/sarbbottam/eslint-find-rules/commits?author=kentcdodds "Code") [📖](https://github.com/sarbbottam/eslint-find-rules/commits?author=kentcdodds "Documentation") [⚠️](https://github.com/sarbbottam/eslint-find-rules/commits?author=kentcdodds "Tests") [👀](#review-kentcdodds "Reviewed Pull Requests") | [<img src="https://avatars1.githubusercontent.com/u/443005?v=3" width="100px;"/><br /><sub><b>Scott Nonnenberg</b></sub>](https://github.com/scottnonnenberg)<br />[💻](https://github.com/sarbbottam/eslint-find-rules/commits?author=scottnonnenberg "Code") [⚠️](https://github.com/sarbbottam/eslint-find-rules/commits?author=scottnonnenberg "Tests") | [<img src="https://avatars3.githubusercontent.com/u/1758366?v=3" width="100px;"/><br /><sub><b>Michał Gołębiowski</b></sub>](https://github.com/mgol)<br />[💻](https://github.com/sarbbottam/eslint-find-rules/commits?author=mgol "Code") | [<img src="https://avatars.githubusercontent.com/u/3869412?v=3" width="100px;"/><br /><sub><b>Jeroen Engels</b></sub>](https://github.com/jfmengels)<br />[📖](https://github.com/sarbbottam/eslint-find-rules/commits?author=jfmengels "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/2449282?v=3" width="100px;"/><br /><sub><b>Dustin Specker</b></sub>](https://github.com/dustinspecker)<br />[💻](https://github.com/sarbbottam/eslint-find-rules/commits?author=dustinspecker "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars1.githubusercontent.com/u/1406203?v=3" width="100px;"/><br /><sub><b>Randy Coulman</b></sub>](https://github.com/randycoulman)<br />[💻](https://github.com/sarbbottam/eslint-find-rules/commits?author=randycoulman "Code") [⚠️](https://github.com/sarbbottam/eslint-find-rules/commits?author=randycoulman "Tests") | [<img src="https://avatars1.githubusercontent.com/u/45469?v=4" width="100px;"/><br /><sub><b>Jordan Harband</b></sub>](https://twitter.com/ljharb)<br />[📖](https://github.com/sarbbottam/eslint-find-rules/commits?author=ljharb "Documentation") [🐛](https://github.com/sarbbottam/eslint-find-rules/issues?q=author%3Aljharb "Bug reports") [💻](https://github.com/sarbbottam/eslint-find-rules/commits?author=ljharb "Code") [💬](#question-ljharb "Answering Questions") [👀](#review-ljharb "Reviewed Pull Requests") [⚠️](https://github.com/sarbbottam/eslint-find-rules/commits?author=ljharb "Tests") [🚇](#infra-ljharb "Infrastructure (Hosting, Build-Tools, etc)") | [<img src="https://avatars1.githubusercontent.com/u/7462525?v=4" width="100px;"/><br /><sub><b>Brad Zacher</b></sub>](https://zacher.com.au)<br />[💻](https://github.com/sarbbottam/eslint-find-rules/commits?author=bradzacher "Code") [⚠️](https://github.com/sarbbottam/eslint-find-rules/commits?author=bradzacher "Tests") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.
Contributions of any kind welcome!

Special thanks to [@mgol](https://github.com/mgol) who created the original script.

## LICENSE

MIT
