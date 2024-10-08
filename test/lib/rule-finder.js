const path = require('path');
const createRequire = require('create-require');
const assert = require('assert');
const proxyquire = require('proxyquire');
const { builtinRules } = require('eslint/use-at-your-own-risk');
const semver = require('semver');
const merge = require('lodash.merge');
const { ESLint } = require('eslint');

const processCwd = process.cwd;
const isV8Eslint = ESLint.configType === 'eslintrc';
const eslintVersion = isV8Eslint ? 'prior-v8' : 'post-v8';

const mockCreateRequire = (getExport, plugins, relative) => {
  // Use the mocked require.
  const moduleRequire = (id) => {
    const targetExport = getExport();
    return module.children
      .find((m) => m.exports === targetExport)
      .require(id);
  };
  return Object.assign(moduleRequire, {
    // The strategy is simple: if called with one of our plugins, just return
    // the module name, as-is. This is a lie because what we return is not a
    // path, but it is simple, and works. Otherwise, we just call the original
    // `resolve` from the stock module.
    resolve: (name) => (
      plugins.includes(name) ? name : createRequire(relative).resolve(name)
    )
  });
};

const mockedBuiltinRules = new Map()
  .set('foo-rule', {})
  .set('old-rule', { meta: { deprecated: true } })
  .set('bar-rule', {})
  .set('baz-rule', {})

const getRuleFinder = proxyquire('../../src/lib/rule-finder', {
  eslint: {
    Linter: class {
      getRules() {
        return mockedBuiltinRules
      }
    },
  },
  "eslint/use-at-your-own-risk": {
    builtinRules: mockedBuiltinRules
  },
  "../rules": {
    get(id) {
      return mockedBuiltinRules.get(id)
    },
    '@global': true
  },
  {
      ignores: [
          "**/node_modules/",
          ".git/"
      ]
  },
  {
      files: ["**/*.js", "**/*.mjs"]
  },
  {
      files: ["**/*.cjs"],
      languageOptions: {
          sourceType: "commonjs",
          ecmaVersion: "latest"
      }
  }
];

const mock = {
  'eslint-plugin-plugin': {
    rules: {
      'foo-rule': {},
      'bar-rule': {},
      'old-plugin-rule': {meta: {deprecated: true}},
      'baz-rule': {}
    },
    '@noCallThru': true,
    '@global': true
  },
  'eslint-plugin-no-rules': {
    processors: {},
    '@noCallThru': true,
    '@global': true
  },
  '@scope/eslint-plugin-scoped-plugin': {
    rules: {
      'foo-rule': {},
      'old-plugin-rule': {meta: {deprecated: true}},
      'bar-rule': {}
    },
    '@noCallThru': true,
    '@global': true
  },
  '@scope/eslint-plugin': {
    rules: {
      'foo-rule': {},
      'old-plugin-rule': {meta: {deprecated: true}},
      'bar-rule': {}
    },
    '@noCallThru': true,
    '@global': true
  },
  '@scope-with-dash/eslint-plugin-scoped-with-dash-plugin': {
    rules: {
      'foo-rule': {},
      'old-plugin-rule': {meta: {deprecated: true}},
      'bar-rule': {}
    },
    '@noCallThru': true,
    '@global': true
  },
  '@scope-with-dash/eslint-plugin': {
    rules: {
      'foo-rule': {},
      'old-plugin-rule': {meta: {deprecated: true}},
      'bar-rule': {}
    },
    '@noCallThru': true,
    '@global': true
  }
};

const mockedDedupedBuiltinRules = new Map()
  .set('foo-rule', {})
  .set('bar-rule', {})
  .set('plugin/duplicate-foo-rule', {})
  .set('plugin/duplicate-bar-rule', {})

const getRuleFinderForDedupeTests = proxyquire('../../src/lib/rule-finder', {
  eslint: {
    Linter: class {
      getRules() {
        return mockedDedupedBuiltinRules
      }
    },
  },
  "eslint/use-at-your-own-risk": {
    builtinRules: mockedDedupedBuiltinRules
  },
  "../rules": {
    get(id) {
      return mockedDedupedBuiltinRules.get(id)
    },
    '@global': true
  },
  module: {
    createRequire: (relative) => mockCreateRequire(
      () => getRuleFinderForDedupeTests,
      [
        'eslint-plugin-plugin'
      ],
      relative
    ),
    '@global': true
  },
  'eslint-plugin-plugin': {
    rules: {
      'duplicate-foo-rule': {},
      'duplicate-bar-rule': {}
    },
    '@noCallThru': true,
    '@global': true
  }
};

const getRuleFinder = isV8Eslint 
  ? proxyquire('../../src/lib/rule-finder', {
      eslint: {
        Linter: class {
          getRules() {
            return new Map()
              .set('foo-rule', {})
              .set('old-rule', {meta: {deprecated: true}})
              .set('bar-rule', {})
              .set('baz-rule', {});
          }
        }
      },
      module: {
        createRequire: (relative) => mockCreateRequire(
          () => getRuleFinder,
          [
            'eslint-plugin-plugin',
            'eslint-plugin-no-rules',
            '@scope/eslint-plugin-scoped-plugin',
            '@scope/eslint-plugin',
            '@scope-with-dash/eslint-plugin-scoped-with-dash-plugin',
            '@scope-with-dash/eslint-plugin'
          ],
          relative
        ),
        '@global': true
      },
      ...mock
    })
  : (specifiedFileRelative, options) => {
      const config = specifiedFileRelative 
        ? proxyquire(path.resolve(specifiedFileRelative), mock)
        : proxyquire(path.resolve(process.cwd(), require(path.join(process.cwd(), 'package.json')).main), mock);
      
      const ruleFinder = proxyquire('../../src/lib/rule-finder', {
        eslint: {
          // for v9 ESLint
          ESLint: class {
            // Mock to validate with rules that are not in ESLint Mock to validate with rules that are not in ESLint, 
            //  or else you will get an error that the rule does not exist in ESLint
            isPathIgnored(filePath) {
              return filePath.includes('.ts') ? true : false;
            }
            // Mock to validate with rules that are not in ESLint Mock to validate with rules that are not in ESLint, 
            //  or else you will get an error that the rule does not exist in ESLint
            // eslint-disable-next-line no-unused-vars
            calculateConfigForFile(filePath) {
              const mergedConfig = {};
              defaultConfig.forEach(config => {
                merge(mergedConfig, config);
              });

              if(!specifiedFileRelative) {
                if (Array.isArray(config)) {
                  config.forEach(config => {
                    merge(mergedConfig, config);
                  });
                  return mergedConfig;
                } else {
                  return merge(mergedConfig, config);
                }
              }

              if (Array.isArray(config)) {
                config.forEach(config => {
                  merge(mergedConfig, config);
                });
                return mergedConfig;
              } else {
                return merge(mergedConfig, config);
              }
            }
          },
        },
        'eslint/use-at-your-own-risk': {
          builtinRules: new Map()
          .set('foo-rule', {})
          .set('old-rule', {meta: {deprecated: true}})
          .set('bar-rule', {})
          .set('baz-rule', {})
        },
      });
      return ruleFinder(specifiedFileRelative, options);
    };

const getRuleFinderForDedupeTests = isV8Eslint 
  ? proxyquire('../../src/lib/rule-finder', {
      eslint: {
        Linter: class {
          getRules() {
            return new Map()
              .set('foo-rule', {})
              .set('bar-rule', {})
              .set('plugin/duplicate-foo-rule', {})
              .set('plugin/duplicate-bar-rule', {});
          }
        }
      },
      module: {
        createRequire: (relative) => mockCreateRequire(
          () => getRuleFinderForDedupeTests,
          [
            'eslint-plugin-plugin'
          ],
          relative
        ),
        '@global': true
      },
      ...mockForDedupeTests
    })
  : (specifiedFileRelative, options) => {
    const config = specifiedFileRelative 
      ? proxyquire(path.resolve(specifiedFileRelative), mockForDedupeTests)
      : proxyquire(path.resolve(process.cwd(), require(path.join(process.cwd(), 'package.json')).main), mockForDedupeTests);

    const ruleFinder = proxyquire('../../src/lib/rule-finder', {
        eslint: {
          ESLint: class {
            isPathIgnored(filePath) {
              return filePath.includes('.ts') ? true : false;
            }
            // eslint-disable-next-line no-unused-vars
            calculateConfigForFile(filePath) {
              const mergedConfig = {};
              defaultConfig.forEach(config => {
                merge(mergedConfig, config);
              });

              if(!specifiedFileRelative) {
                if (Array.isArray(config)) {
                  config.forEach(config => {
                    merge(mergedConfig, config);
                  });
                  return mergedConfig;
                } else {
                  return merge(mergedConfig, config);
                }
              }

              if (Array.isArray(config)) {
                config.forEach(config => {
                  merge(mergedConfig, config);
                });
                return mergedConfig;
              } else {
                return merge(mergedConfig, config);
              }
            }
          },
        },
        'eslint/use-at-your-own-risk': {
          builtinRules: new Map()
          .set('foo-rule', {})
          .set('bar-rule', {})
          .set('plugin/duplicate-foo-rule', {})
          .set('plugin/duplicate-bar-rule', {})
        },
      });
      return ruleFinder(specifiedFileRelative, options);
    };

const getRuleFinderNoFlatSupport = proxyquire('../../src/lib/rule-finder', {
  eslint: {
    Linter: class {
      getRules() {
        return mockedBuiltinRules
      }
    },
  },
  'eslint/use-at-your-own-risk': {
    FlatESLint: undefined
  }
});

const noSpecifiedFile = path.resolve(process.cwd(), `./test/fixtures/${eslintVersion}/no-path`);
const specifiedFileRelative = `./test/fixtures/${eslintVersion}/${isV8Eslint ? 'eslint.json' : 'eslint_json.js'}`;
const specifiedFileAbsolute = path.join(process.cwd(), specifiedFileRelative);
const noRulesFile = path.join(process.cwd(), `./test/fixtures/${eslintVersion}/eslint-with-plugin-with-no-rules.json`);
const noDuplicateRulesFiles = `./test/fixtures/${eslintVersion}/eslint-dedupe-plugin-rules.json`;
const usingDeprecatedRulesFile = path.join(process.cwd(), `./test/fixtures/${eslintVersion}/eslint-with-deprecated-rules.json`);
const usingWithOverridesFile = path.join(process.cwd(), `./test/fixtures/${eslintVersion}/eslint-with-overrides.json`);
const specifiedFlatConfigFileRelative = `./test/fixtures/post-v8/eslint-flat-config.js`;

describe('rule-finder', function() {
  // increase timeout because proxyquire adds a significant delay
  this.timeout(semver.satisfies(process.version, '> 10') ? 5e3 : (semver.satisfies(process.version, '> 4') ? 20e3 : 30e3));

  afterEach(() => {
    process.cwd = processCwd;
  });

  it('no specifiedFile - unused rules', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder();
    assert.deepEqual(ruleFinder.getUnusedRules(), ['bar-rule', 'baz-rule']);
  });

  it('no specifiedFile - unused rules including deprecated', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {includeDeprecated: true});
    assert.deepEqual(ruleFinder.getUnusedRules(), ['bar-rule', 'baz-rule', 'old-rule']);
  });

  it('no specifiedFile - current rules', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder();
    assert.deepEqual(ruleFinder.getCurrentRules(), ['foo-rule']);
  });

  it('no specifiedFile - current rule config', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder();
    assert.deepEqual(ruleFinder.getCurrentRulesDetailed(), {'foo-rule': [2]});
  });

  it('no specifiedFile - plugin rules', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder();
    assert.deepEqual(ruleFinder.getPluginRules(), []);
  });

  it('no specifiedFile - all available rules', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder();
    assert.deepEqual(ruleFinder.getAllAvailableRules(), ['bar-rule', 'baz-rule', 'foo-rule']);
  });

  it('no specifiedFile - all available rules without core', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {omitCore: true});
    assert.deepEqual(ruleFinder.getAllAvailableRules(), []);
  });

  it('no specifiedFile - all available rules including deprecated', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {includeDeprecated: true});
    assert.deepEqual(ruleFinder.getAllAvailableRules(), ['bar-rule', 'baz-rule', 'foo-rule', 'old-rule']);
  });

  it('specifiedFile (relative path) - unused rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative);
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      '@scope-with-dash/bar-rule',
      '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
      '@scope/bar-rule',
      '@scope/scoped-plugin/bar-rule',
      'baz-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule'
    ]);
  });

  it('specifiedFile (relative path) - unused rules including deprecated', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {includeDeprecated: true});
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      '@scope-with-dash/bar-rule',
      '@scope-with-dash/old-plugin-rule',
      '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
      '@scope-with-dash/scoped-with-dash-plugin/old-plugin-rule',
      '@scope/bar-rule',
      '@scope/old-plugin-rule',
      '@scope/scoped-plugin/bar-rule',
      '@scope/scoped-plugin/old-plugin-rule',
      'baz-rule',
      'old-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'plugin/old-plugin-rule'
    ]);
  });

  it('specifiedFile (relative path) - current rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative);
    assert.deepEqual(ruleFinder.getCurrentRules(), [
      '@scope-with-dash/foo-rule',
      '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
      '@scope/foo-rule',
      '@scope/scoped-plugin/foo-rule',
      'bar-rule',
      'foo-rule'
    ]);
  });

  it('specifiedFile (relative path) - current rules with ext', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative, { ext: ['.json'] });
    assert.deepEqual(ruleFinder.getCurrentRules(), [
      '@scope-with-dash/foo-rule',
      '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
      '@scope/foo-rule',
      '@scope/scoped-plugin/foo-rule',
      'bar-rule',
      'foo-rule'
    ]);
  });

  it('specifiedFile (relative path) - current rules with ext without dot', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative, { ext: ['json'] });
    assert.deepEqual(ruleFinder.getCurrentRules(), [
      '@scope-with-dash/foo-rule',
      '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
      '@scope/foo-rule',
      '@scope/scoped-plugin/foo-rule',
      'bar-rule',
      'foo-rule'
    ]);
  });

  it('specifiedFile (relative path) - current rules with ext not found', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative, { ext: ['.ts'] });
    assert.deepEqual(ruleFinder.getCurrentRules(), []);
  });

  it('specifiedFile (relative path) - current rule config', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative);
    assert.deepEqual(ruleFinder.getCurrentRulesDetailed(), {
      '@scope-with-dash/foo-rule': [2],
      '@scope-with-dash/scoped-with-dash-plugin/foo-rule': [2],
      '@scope/foo-rule': [2],
      '@scope/scoped-plugin/foo-rule': [2],
      'bar-rule': [2],
      'foo-rule': [2]
    });
  });

  it('specifiedFile (relative path) - plugin rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative);
    assert.deepEqual(ruleFinder.getPluginRules(), [
      '@scope-with-dash/bar-rule',
      '@scope-with-dash/foo-rule',
      '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
      '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
      '@scope/bar-rule',
      '@scope/foo-rule',
      '@scope/scoped-plugin/bar-rule',
      '@scope/scoped-plugin/foo-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule'
    ]);
  });

  it('specifiedFile (relative path) - plugin rules including deprecated', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {includeDeprecated: true});
    assert.deepEqual(ruleFinder.getPluginRules(), [
      '@scope-with-dash/bar-rule',
      '@scope-with-dash/foo-rule',
      '@scope-with-dash/old-plugin-rule',
      '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
      '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
      '@scope-with-dash/scoped-with-dash-plugin/old-plugin-rule',
      '@scope/bar-rule',
      '@scope/foo-rule',
      '@scope/old-plugin-rule',
      '@scope/scoped-plugin/bar-rule',
      '@scope/scoped-plugin/foo-rule',
      '@scope/scoped-plugin/old-plugin-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'plugin/old-plugin-rule'
    ]);
  });

  it('specifiedFile (relative path) - all available rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative);
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        '@scope-with-dash/bar-rule',
        '@scope-with-dash/foo-rule',
        '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
        '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
        '@scope/bar-rule',
        '@scope/foo-rule',
        '@scope/scoped-plugin/bar-rule',
        '@scope/scoped-plugin/foo-rule',
        'bar-rule',
        'baz-rule',
        'foo-rule',
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule'
      ]
    );
  });

  it('specifiedFile (relative path) - all available rules without core', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {omitCore: true});
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        '@scope-with-dash/bar-rule',
        '@scope-with-dash/foo-rule',
        '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
        '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
        '@scope/bar-rule',
        '@scope/foo-rule',
        '@scope/scoped-plugin/bar-rule',
        '@scope/scoped-plugin/foo-rule',
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule'
      ]
    );
  });

  it('specifiedFile (relative path) - all available rules including deprecated', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {includeDeprecated: true});
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        '@scope-with-dash/bar-rule',
        '@scope-with-dash/foo-rule',
        '@scope-with-dash/old-plugin-rule',
        '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
        '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
        '@scope-with-dash/scoped-with-dash-plugin/old-plugin-rule',
        '@scope/bar-rule',
        '@scope/foo-rule',
        '@scope/old-plugin-rule',
        '@scope/scoped-plugin/bar-rule',
        '@scope/scoped-plugin/foo-rule',
        '@scope/scoped-plugin/old-plugin-rule',
        'bar-rule',
        'baz-rule',
        'foo-rule',
        'old-rule',
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule',
        'plugin/old-plugin-rule'
      ]
    );
  });

  it('specifiedFile (absolute path) - unused rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      '@scope-with-dash/bar-rule',
      '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
      '@scope/bar-rule',
      '@scope/scoped-plugin/bar-rule',
      'baz-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule'
    ]);
  });

  it('specifiedFile (absolute path) - unused rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {includeDeprecated: true});
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      '@scope-with-dash/bar-rule',
      '@scope-with-dash/old-plugin-rule',
      '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
      '@scope-with-dash/scoped-with-dash-plugin/old-plugin-rule',
      '@scope/bar-rule',
      '@scope/old-plugin-rule',
      '@scope/scoped-plugin/bar-rule',
      '@scope/scoped-plugin/old-plugin-rule',
      'baz-rule',
      'old-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'plugin/old-plugin-rule'
    ]);
  });

  it('specifiedFile (absolute path) - current rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(ruleFinder.getCurrentRules(), [
      '@scope-with-dash/foo-rule',
      '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
      '@scope/foo-rule',
      '@scope/scoped-plugin/foo-rule',
      'bar-rule',
      'foo-rule'
    ]);
  });

  it('specifiedFile (absolute path) - current rule config', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(ruleFinder.getCurrentRulesDetailed(), {
      '@scope-with-dash/foo-rule': [2],
      '@scope-with-dash/scoped-with-dash-plugin/foo-rule': [2],
      '@scope/foo-rule': [2],
      '@scope/scoped-plugin/foo-rule': [2],
      'foo-rule': [2],
      'bar-rule': [2]
    });
  });

  it('specifiedFile (absolute path) - plugin rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(ruleFinder.getPluginRules(), [
      '@scope-with-dash/bar-rule',
      '@scope-with-dash/foo-rule',
      '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
      '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
      '@scope/bar-rule',
      '@scope/foo-rule',
      '@scope/scoped-plugin/bar-rule',
      '@scope/scoped-plugin/foo-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule'
    ]);
  });

  it('specifiedFile (absolute path) - plugin rules including deprecated', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {includeDeprecated: true});
    assert.deepEqual(ruleFinder.getPluginRules(), [
      '@scope-with-dash/bar-rule',
      '@scope-with-dash/foo-rule',
      '@scope-with-dash/old-plugin-rule',
      '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
      '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
      '@scope-with-dash/scoped-with-dash-plugin/old-plugin-rule',
      '@scope/bar-rule',
      '@scope/foo-rule',
      '@scope/old-plugin-rule',
      '@scope/scoped-plugin/bar-rule',
      '@scope/scoped-plugin/foo-rule',
      '@scope/scoped-plugin/old-plugin-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'plugin/old-plugin-rule'
    ]);
  });

  it('specifiedFile (absolute path) - all available rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        '@scope-with-dash/bar-rule',
        '@scope-with-dash/foo-rule',
        '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
        '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
        '@scope/bar-rule',
        '@scope/foo-rule',
        '@scope/scoped-plugin/bar-rule',
        '@scope/scoped-plugin/foo-rule',
        'bar-rule',
        'baz-rule',
        'foo-rule',
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule'
      ]
    );
  });

  it('specifiedFile (absolute path) - all available rules including deprecated', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {includeDeprecated: true});
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        '@scope-with-dash/bar-rule',
        '@scope-with-dash/foo-rule',
        '@scope-with-dash/old-plugin-rule',
        '@scope-with-dash/scoped-with-dash-plugin/bar-rule',
        '@scope-with-dash/scoped-with-dash-plugin/foo-rule',
        '@scope-with-dash/scoped-with-dash-plugin/old-plugin-rule',
        '@scope/bar-rule',
        '@scope/foo-rule',
        '@scope/old-plugin-rule',
        '@scope/scoped-plugin/bar-rule',
        '@scope/scoped-plugin/foo-rule',
        '@scope/scoped-plugin/old-plugin-rule',
        'bar-rule',
        'baz-rule',
        'foo-rule',
        'old-rule',
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule',
        'plugin/old-plugin-rule'
      ]
    );
  });

  it('specifiedFile (absolute path) without rules - plugin rules', async () => {
    const ruleFinder = await getRuleFinder(noRulesFile);
    assert.deepEqual(ruleFinder.getPluginRules(), [
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule'
    ]);
  });

  it('dedupes plugin rules - all available rules', async () => {
    const ruleFinder = await getRuleFinderForDedupeTests(noDuplicateRulesFiles);
    assert.deepEqual(ruleFinder.getAllAvailableRules(), [
      'bar-rule',
      'foo-rule',
      'plugin/duplicate-bar-rule',
      'plugin/duplicate-foo-rule'
    ]);
  });

  it('dedupes plugin rules - unused rules', async () => {
    const ruleFinder = await getRuleFinderForDedupeTests(noDuplicateRulesFiles);
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      'bar-rule',
      'plugin/duplicate-foo-rule'
    ]);
  });

  it('specifiedFile (absolute path) without deprecated rules - deprecated rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(ruleFinder.getDeprecatedRules(), []);
  });

  it('specifiedFile (absolute path) with deprecated rules - deprecated rules', async () => {
    const ruleFinder = await getRuleFinder(usingDeprecatedRulesFile);
    assert.deepEqual(ruleFinder.getDeprecatedRules(), [
      '@scope-with-dash/old-plugin-rule',
      '@scope-with-dash/scoped-with-dash-plugin/old-plugin-rule',
      '@scope/old-plugin-rule',
      '@scope/scoped-plugin/old-plugin-rule',
      'old-rule',
      'plugin/old-plugin-rule'
    ]);
  });

  it('check overrides - unused rules', async () => {
    const ruleFinder = await getRuleFinder(usingWithOverridesFile, {'ext': ['.txt', '.json']});
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      "@scope-with-dash/bar-rule",
      "@scope-with-dash/foo-rule",
      "@scope-with-dash/scoped-with-dash-plugin/bar-rule",
      "@scope-with-dash/scoped-with-dash-plugin/foo-rule",
      "@scope/bar-rule",
      "@scope/scoped-plugin/bar-rule",
      "bar-rule",
      "baz-rule",
      "plugin/bar-rule",
      "plugin/baz-rule",
      "plugin/foo-rule",
    ]);
  });

  it('flat config - should throw an exception if FlatESLint is not defined', async () => {
    try {
      await getRuleFinderNoFlatSupport(specifiedFlatConfigFileRelative, {useFlatConfig: true})
      assert.fail('Expected an error to be thrown');
    } catch (error) {
      assert.strictEqual(error, 'This version of ESLint does not support flat config.')
    }
  });

  (semver.satisfies(eslintPkg.version, '>= 8') ? describe : describe.skip)('flat config - supported', () => {
    it('specifiedFile (relative path) - unused rules', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, {useFlatConfig: true});
      assert.deepEqual(ruleFinder.getUnusedRules(), [
        'bar-rule',
        'baz-rule',
        'plugin/bar-rule'
      ]);
    });

    it('specifiedFile (relative path) - unused rules including deprecated', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, {includeDeprecated: true, useFlatConfig: true});
      assert.deepEqual(ruleFinder.getUnusedRules(), [
        'bar-rule',
        'baz-rule',
        'old-rule',
        'plugin/bar-rule',
        'plugin/old-plugin-rule'
      ]);
    });

    it('specifiedFile (relative path) - current rules', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, {useFlatConfig: true});
      assert.deepEqual(ruleFinder.getCurrentRules(), [
        'foo-rule',
        'plugin/foo-rule'
      ]);
    });

    it('specifiedFile (relative path) - current rules with ext', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, { ext: ['.json'], useFlatConfig: true});
      assert.deepEqual(ruleFinder.getCurrentRules(), [
        'jsonPlugin/foo-rule'
      ]);
    });

    it('specifiedFile (relative path) - current rules with ext without dot', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, { ext: ['json'], useFlatConfig: true});
      assert.deepEqual(ruleFinder.getCurrentRules(), [
        'jsonPlugin/foo-rule'
      ]);
    });

    it('specifiedFile (relative path) - current rules with ext not found', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, { ext: ['.ts'], useFlatConfig: true });
      assert.deepEqual(ruleFinder.getCurrentRules(), []);
    });

    it('specifiedFile (relative path) - plugin rules', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, { useFlatConfig: true});
      assert.deepEqual(ruleFinder.getPluginRules(), [
        'plugin/bar-rule',
        'plugin/foo-rule'
      ]);
    });

    it('specifiedFile (relative path) - plugin rules including deprecated', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, {includeDeprecated: true, useFlatConfig: true});
      assert.deepEqual(ruleFinder.getPluginRules(), [
        'plugin/bar-rule',
        'plugin/foo-rule',
        'plugin/old-plugin-rule'
      ]);
    });

    it('specifiedFile (relative path) - all available rules', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, { useFlatConfig: true });
      assert.deepEqual(
        ruleFinder.getAllAvailableRules(),
        [
          'bar-rule',
          'baz-rule',
          'foo-rule',
          'plugin/bar-rule',
          'plugin/foo-rule'
        ]
      );
    });

    it('specifiedFile (relative path) - all available rules without core', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, {omitCore: true, useFlatConfig: true});
      assert.deepEqual(
        ruleFinder.getAllAvailableRules(),
        [
          'plugin/bar-rule',
          'plugin/foo-rule'
        ]
      );
    });

    it('specifiedFile (relative path) - all available rules including deprecated', async () => {
      const ruleFinder = await getRuleFinder(specifiedFlatConfigFileRelative, {includeDeprecated: true, useFlatConfig: true});
      assert.deepEqual(
        ruleFinder.getAllAvailableRules(),
        [
          'bar-rule',
          'baz-rule',
          'foo-rule',
          'old-rule',
          'plugin/bar-rule',
          'plugin/foo-rule',
          'plugin/old-plugin-rule'
        ]
      );
    });
  });
});
