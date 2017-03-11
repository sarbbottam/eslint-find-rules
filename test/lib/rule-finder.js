const path = require('path');
const assert = require('assert');
const proxyquire = require('proxyquire');

const processCwd = process.cwd;

const getRuleFinder = proxyquire('../../src/lib/rule-finder', {
  eslint: {
    linter: {
      getRules() {
        return new Map()
          .set('foo-rule', {})
          .set('bar-rule', {})
          .set('baz-rule', {});
      }
    }
  },
  'eslint-plugin-plugin': {
    rules: {
      'foo-rule': true,
      'bar-rule': true,
      'baz-rule': true
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
      'foo-rule': true,
      'bar-rule': true
    },
    '@noCallThru': true,
    '@global': true
  }
});

const noSpecifiedFile = path.resolve(process.cwd(), './test/fixtures/no-path');
const specifiedFileRelative = './test/fixtures/eslint.json';
const specifiedFileAbsolute = path.join(process.cwd(), specifiedFileRelative);
const noRulesFile = path.join(process.cwd(), './test/fixtures/eslint-with-plugin-with-no-rules.json');

describe('rule-finder', () => {
  afterEach(() => {
    process.cwd = processCwd;
  });

  it('no specifiedFile is passed to the constructor', () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = getRuleFinder();
    assert.deepEqual(ruleFinder.getUnusedRules(), ['bar-rule', 'baz-rule']);
  });

  it('no specifiedFile - current rules', () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = getRuleFinder();
    assert.deepEqual(ruleFinder.getCurrentRules(), ['foo-rule']);
  });

  it('no specifiedFile - current rule config', () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = getRuleFinder();
    assert.deepEqual(ruleFinder.getCurrentRulesDetailed(), {'foo-rule': [2]});
  });

  it('no specifiedFile - plugin rules', () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = getRuleFinder();
    assert.deepEqual(ruleFinder.getPluginRules(), []);
  });

  it('no specifiedFile - all available rules', () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = getRuleFinder();
    assert.deepEqual(ruleFinder.getAllAvailableRules(), ['bar-rule', 'baz-rule', 'foo-rule']);
  });

  it('no specifiedFile - all available rules without core', () => {
    process.cwd = function () {
      return noSpecifiedFile;
    };
    const ruleFinder = getRuleFinder(null, true);
    assert.deepEqual(ruleFinder.getAllAvailableRules(), []);
  });

  it('specifiedFile (relative path) is passed to the constructor', () => {
    const ruleFinder = getRuleFinder(specifiedFileRelative);
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      'baz-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'scoped-plugin/bar-rule'
    ]);
  });

  it('specifiedFile (relative path) - current rules', () => {
    const ruleFinder = getRuleFinder(specifiedFileRelative);
    assert.deepEqual(ruleFinder.getCurrentRules(), ['bar-rule', 'foo-rule', 'scoped-plugin/foo-rule']);
  });

  it('specifiedFile (relative path) - current rule config', () => {
    const ruleFinder = getRuleFinder(specifiedFileRelative);
    assert.deepEqual(ruleFinder.getCurrentRulesDetailed(), {
      'bar-rule': [2],
      'foo-rule': [2],
      'scoped-plugin/foo-rule': [2]
    });
  });

  it('specifiedFile (relative path) - plugin rules', () => {
    const ruleFinder = getRuleFinder(specifiedFileRelative);
    assert.deepEqual(ruleFinder.getPluginRules(), [
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'scoped-plugin/bar-rule',
      'scoped-plugin/foo-rule'
    ]);
  });

  it('specifiedFile (relative path) - all available rules', () => {
    const ruleFinder = getRuleFinder(specifiedFileRelative);
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        'bar-rule',
        'baz-rule',
        'foo-rule',
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule',
        'scoped-plugin/bar-rule',
        'scoped-plugin/foo-rule'
      ]
    );
  });

  it('specifiedFile (relative path) - all available rules without core', () => {
    const ruleFinder = getRuleFinder(specifiedFileRelative, true);
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule',
        'scoped-plugin/bar-rule',
        'scoped-plugin/foo-rule'
      ]
    );
  });

  it('specifiedFile (absolute path) is passed to the constructor', () => {
    const ruleFinder = getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(ruleFinder.getUnusedRules(), [
      'baz-rule',
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'scoped-plugin/bar-rule'
    ]);
  });

  it('specifiedFile (absolute path) - current rules', () => {
    const ruleFinder = getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(ruleFinder.getCurrentRules(), ['bar-rule', 'foo-rule', 'scoped-plugin/foo-rule']);
  });

  it('specifiedFile (absolute path) - current rule config', () => {
    const ruleFinder = getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(ruleFinder.getCurrentRulesDetailed(), {
      'foo-rule': [2],
      'bar-rule': [2],
      'scoped-plugin/foo-rule': [2]
    });
  });

  it('specifiedFile (absolute path) - plugin rules', () => {
    const ruleFinder = getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(ruleFinder.getPluginRules(), [
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule',
      'scoped-plugin/bar-rule',
      'scoped-plugin/foo-rule'
    ]);
  });

  it('specifiedFile (absolute path) - all available rules', () => {
    const ruleFinder = getRuleFinder(specifiedFileAbsolute);
    assert.deepEqual(
      ruleFinder.getAllAvailableRules(),
      [
        'bar-rule',
        'baz-rule',
        'foo-rule',
        'plugin/bar-rule',
        'plugin/baz-rule',
        'plugin/foo-rule',
        'scoped-plugin/bar-rule',
        'scoped-plugin/foo-rule'
      ]
    );
  });

  it('specifiedFile (absolute path) without rules - plugin rules', () => {
    const ruleFinder = getRuleFinder(noRulesFile);
    assert.deepEqual(ruleFinder.getPluginRules(), [
      'plugin/bar-rule',
      'plugin/baz-rule',
      'plugin/foo-rule'
    ]);
  });
});
