const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const consoleLog = console.log; // eslint-disable-line no-console
const processExit = process.exit;

const stub = {
  '../lib/rule-finder'() {
    return {
      getCurrentRules() {}, // Noop
      getCurrentRulesDetailed() {} // Noop
    };
  },
  '../lib/array-diff': sinon.stub().returns(['diff']),
  '../lib/object-diff': sinon.stub().returns([{'test-rule': {config1: 'foo-config', config2: 'bar-config'}}])
};
let exitStatus;

describe('diff', () => {
  beforeEach(() => {
    process.argv = process.argv.slice(0, 2);
    sinon.stub(console, 'log').callsFake((...args) => {
      // Print out everything but the test target's output
      if (!args[0].match(/(diff|(Could not load|requires) ESLint)/)) {
        consoleLog(...args);
      }
    });
    exitStatus = null;
    process.exit = status => {
      exitStatus = status;
    };
  });

  afterEach(() => {
    console.log.restore(); // eslint-disable-line no-console
    process.exit = processExit;
    // purge yargs cache
    delete require.cache[require.resolve('yargs')];
  });

  it('checks for eslint', () => {
    proxyquire('../../src/bin/diff', {
      '../lib/check-eslint': {
        check: () => false,
        requiredVersion: '1.2.3'
      }
    });
    assert.ok(
      console.log.calledWith( // eslint-disable-line no-console
        sinon.match(
          /(Could not load|requires) ESLint/
        )
      )
    );
    assert.equal(exitStatus, 1);
  });

  it('logs diff', () => {
    process.argv[2] = './foo';
    process.argv[3] = './bar';
    proxyquire('../../src/bin/diff', stub);
    assert.ok(
      console.log.calledWith( // eslint-disable-line no-console
        sinon.match(
          /diff rules[^]*in foo but not in bar:[^]*diff[^]*in bar but not in foo:[^]*diff/
        )
      )
    );
    assert.equal(exitStatus, 0);
  });

  it('logs diff verbosely', () => {
    process.argv[2] = '--verbose';
    process.argv[3] = './foo';
    process.argv[4] = './bar';
    proxyquire('../../src/bin/diff', stub);
    assert.ok(
      console.log.calledWith( // eslint-disable-line no-console
        sinon.match(
          /diff rules[^]*foo[^]*bar[^]*test-rule[^]*foo-config[^]*bar-config/
        )
      )
    );
    assert.equal(exitStatus, 0);
  });
});
