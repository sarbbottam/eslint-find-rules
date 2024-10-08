const path = require('path');
const assert = require('assert');
const proxyquire = require('proxyquire');
const mockRequire = require('mock-require');

const semver = require('semver');
const eslintPkg = require('eslint/package.json');

const processCwd = process.cwd;

const mockedBuiltinRules = new Map()
  .set('foo-rule', {})
  .set('old-rule', { meta: { deprecated: true } })
  .set('bar-rule', {})
  .set('baz-rule', {})


const mockedPlugins = {
  'eslint-plugin-plugin': {
    rules: {
      'foo-rule': {},
      'bar-rule': {},
      'old-plugin-rule': {meta: {deprecated: true}},
      'baz-rule': {}
    }
  },
  'eslint-plugin-no-rules': {
    processors: {},
  },
  'eslint-plugin-duplicate-plugin': {
    rules: {
      'duplicate-foo-rule': {},
      'duplicate-bar-rule': {}
    },
  },
  '@scope/eslint-plugin-scoped-plugin': {
    rules: {
      'foo-rule': {},
      'old-plugin-rule': {meta: {deprecated: true}},
      'bar-rule': {}
    },
  },
  '@scope/eslint-plugin': {
    rules: {
      'foo-rule': {},
      'old-plugin-rule': {meta: {deprecated: true}},
      'bar-rule': {}
    },
  },
  '@scope-with-dash/eslint-plugin-scoped-with-dash-plugin': {
    rules: {
      'foo-rule': {},
      'old-plugin-rule': {meta: {deprecated: true}},
      'bar-rule': {}
    },
  },
  '@scope-with-dash/eslint-plugin': {
    rules: {
      'foo-rule': {},
      'old-plugin-rule': {meta: {deprecated: true}},
      'bar-rule': {}
    },
  }
}

function mockPluginImports(mockedPlugins) {
  Object.entries(mockedPlugins).forEach(([pluginName, plugin]) => {
    mockRequire(pluginName, plugin);
  })
}

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
  })
;

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
});

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

const noSpecifiedFile = path.resolve(process.cwd(), `./test/fixtures/post-v8/no-path`);
const specifiedFileRelative = `./test/fixtures/post-v8/eslint-flat-config.js`;
const specifiedFileAbsolute = path.join(process.cwd(), specifiedFileRelative);
const noRulesFile = path.join(process.cwd(), `./test/fixtures/post-v8/eslint-flat-config-with-plugin-with-no-rules.js`);
const noDuplicateRulesFiles = `./test/fixtures/post-v8/eslint-flat-config-dedupe-plugin-rules.js`;
const usingDeprecatedRulesFile = path.join(process.cwd(), `./test/fixtures/post-v8/eslint-flat-config-with-deprecated-rules.js`);
const usingWithOverridesFile = path.join(process.cwd(), `./test/fixtures/post-v8/eslint-flat-config-with-overrides.js`);

(semver.satisfies(eslintPkg.version, '>= 8') ? describe : describe.skip)('rule-finder (flat config)', function() {
  // increase timeout because proxyquire adds a significant delay
  this.timeout(5e3);

  // Inject all the mocked plugins importations
  before(() => {
    mockPluginImports(mockedPlugins);
  });

  afterEach(() => {
    process.cwd = processCwd;
  });

  it('no specifiedFile - unused rules', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {useFlatConfig: true});
    assert.deepEqual(ruleFinder.getUnusedRules(), ['bar-rule', 'baz-rule']);
  });

  it('no specifiedFile - unused rules including deprecated', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {useFlatConfig: true, includeDeprecated: true});
    assert.deepEqual(ruleFinder.getUnusedRules(), ['bar-rule', 'baz-rule', 'old-rule']);
  });

  it('no specifiedFile - current rules', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {useFlatConfig: true});
    assert.deepEqual(ruleFinder.getCurrentRules(), ['foo-rule']);
  });

  it('no specifiedFile - current rule config', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {useFlatConfig: true});
    assert.deepEqual(ruleFinder.getCurrentRulesDetailed(), {'foo-rule': [2]});
  });

  it('no specifiedFile - plugin rules', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {useFlatConfig: true});
    assert.deepEqual(ruleFinder.getPluginRules(), []);
  });

  it('no specifiedFile - all available rules', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {useFlatConfig: true});
    assert.deepEqual(ruleFinder.getAllAvailableRules(), ['bar-rule', 'baz-rule', 'foo-rule']);
  });

  it('no specifiedFile - all available rules without core', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {useFlatConfig: true, omitCore: true});
    assert.deepEqual(ruleFinder.getAllAvailableRules(), []);
  });

  it('no specifiedFile - all available rules including deprecated', async () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = await getRuleFinder(null, {useFlatConfig: true, includeDeprecated: true});
    assert.deepEqual(ruleFinder.getAllAvailableRules(), ['bar-rule', 'baz-rule', 'foo-rule', 'old-rule']);
  });

  it('specifiedFile (relative path) - unused rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true, includeDeprecated: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileRelative, { useFlatConfig: true, ext: ['.json'] });
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
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true, ext: ['json'] });
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
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true, ext: ['.ts'] });
    assert.deepEqual(ruleFinder.getCurrentRules(), []);
  });

  it('specifiedFile (relative path) - current rule config', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true, includeDeprecated: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true, omitCore: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileRelative, {useFlatConfig: true, includeDeprecated: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {useFlatConfig: true, includeDeprecated: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {useFlatConfig: true, includeDeprecated: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {useFlatConfig: true, includeDeprecated: true});
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
    const ruleFinder = await getRuleFinder(noRulesFile, {useFlatConfig: true});
    assert.deepEqual(ruleFinder.getPluginRules(), [
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule'
    ]);
  });

  it('dedupes plugin rules - all available rules', async () => {
    const ruleFinder = await getRuleFinderForDedupeTests(noDuplicateRulesFiles, {useFlatConfig: true});
    assert.deepEqual(ruleFinder.getAllAvailableRules(), [
      'bar-rule',
      'foo-rule',
      'plugin/duplicate-bar-rule',
      'plugin/duplicate-foo-rule'
    ]);
  });

  it('dedupes plugin rules - unused rules', async () => {
    const ruleFinder = await getRuleFinderForDedupeTests(noDuplicateRulesFiles, {useFlatConfig: true});
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      'bar-rule',
      'plugin/duplicate-foo-rule'
    ]);
  });

  it('specifiedFile (absolute path) without deprecated rules - deprecated rules', async () => {
    const ruleFinder = await getRuleFinder(specifiedFileAbsolute, {useFlatConfig: true});
    assert.deepEqual(ruleFinder.getDeprecatedRules(), []);
  });

  it('specifiedFile (absolute path) with deprecated rules - deprecated rules', async () => {
    const ruleFinder = await getRuleFinder(usingDeprecatedRulesFile, {useFlatConfig: true});
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
    const ruleFinder = await getRuleFinder(usingWithOverridesFile, {useFlatConfig: true, 'ext': ['.txt', '.json']});
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
      await getRuleFinderNoFlatSupport(specifiedFileRelative, {useFlatConfig: true})
      assert.fail('Expected an error to be thrown');
    } catch (error) {
      assert.strictEqual(error, 'This version of ESLint does not support flat config.')
    }
  });
});