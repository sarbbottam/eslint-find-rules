const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const consoleLog = console.log; // eslint-disable-line no-console
const processExit = process.exit;

const getCurrentRules = sinon.stub().returns(['current', 'rules']);
const getPluginRules = sinon.stub().returns(['plugin', 'rules']);
const getAllAvailableRules = sinon.stub().returns(['all', 'available']);
const getUnusedRules = sinon.stub().returns(['unused', 'rules']);
const getDeprecatedRules = sinon.stub().returns(['deprecated', 'rules']);

let stub;
let exitStatus;

describe('bin', () => {
  beforeEach(() => {
    stub = {
      '../lib/rule-finder'() {
        return {
          getCurrentRules,
          getPluginRules,
          getAllAvailableRules,
          getUnusedRules,
          getDeprecatedRules
        };
      }
    };

    console.log = (...args) => { // eslint-disable-line no-console
      if (args[0].match(/(current|plugin|all-available|unused|deprecated|rules found)/)) {
        return;
      }
      consoleLog(...args);
    };
    exitStatus = null;
    process.exit = status => {
      exitStatus = status;
    };
    process.argv = process.argv.slice(0, 2);
  });

  afterEach(() => {
    console.log = consoleLog; // eslint-disable-line no-console
    process.exit = processExit;
    // Purge yargs cache
    delete require.cache[require.resolve('yargs')];
  });

  it('checks for eslint', () => {
    let callCount = 0;
    console.log = (...args) => { // eslint-disable-line no-console
      callCount += 1;
      if (args[0].match(
        /(Could not load|requires) ESLint/)
      ) {
        return;
      }
      consoleLog(...args);
    };
    proxyquire('../../src/bin/find', {
      '../lib/check-eslint': {
        check: () => false,
        requiredVersion: '1.2.3'
      }
    });
    assert.equal(callCount, 2);
    assert.equal(exitStatus, 1);
  });

  it('no option', () => {
    let callCount = 0;
    console.log = (...args) => { // eslint-disable-line no-console
      callCount += 1;
      if (args[0].match(
        /(no option provided, please provide a valid option|usage:|eslint-find-rules \[option] <file> \[flag])/)
      ) {
        return;
      }
      consoleLog(...args);
    };
    proxyquire('../../src/bin/find', stub);
    assert.equal(callCount, 3); // eslint-disable-line no-console
  });

  it('option -c|--current', () => {
    process.argv[2] = '-c';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getCurrentRules.called);
    assert.equal(exitStatus, 0);
  });

  it('option -p|--plugin', () => {
    process.argv[2] = '-p';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getPluginRules.called);
    assert.equal(exitStatus, 0);
  });

  it('option -a|--all-available', () => {
    process.argv[2] = '-a';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getAllAvailableRules.called);
    process.argv[2] = '--all-available';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getAllAvailableRules.called);
    assert.equal(exitStatus, 0);
  });

  it('option -u|--unused', () => {
    process.argv[2] = '-u';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getUnusedRules.called);
    assert.equal(exitStatus, 1);
  });

  it('options -u|--unused and no unused rules found', () => {
    getUnusedRules.returns([]);
    process.argv[2] = '-u';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getUnusedRules.called);
    assert.equal(exitStatus, 0);
  });

  it('option -u|--unused along with -n', () => {
    process.argv[2] = '-u';
    process.argv[3] = '-n';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getUnusedRules.called);
    assert.equal(exitStatus, 0);
  });

  it('option -u|--unused along with --no-error', () => {
    process.argv[2] = '-u';
    process.argv[3] = '--no-error';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getUnusedRules.called);
    assert.equal(exitStatus, 0);
  });

  it('option -d|--deprecated', () => {
    process.argv[2] = '-d';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getDeprecatedRules.called);
    assert.equal(exitStatus, 1);
  });

  it('options -d|--deprecated and no deprecated rules found', () => {
    getDeprecatedRules.returns([]);
    process.argv[2] = '-d';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getDeprecatedRules.called);
    assert.equal(exitStatus, 0);
  });

  it('option -d|--deprecated along with -n', () => {
    process.argv[2] = '-d';
    process.argv[3] = '-n';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getDeprecatedRules.called);
    assert.equal(exitStatus, 0);
  });

  it('option -d|--deprecated along with --no-error', () => {
    process.argv[2] = '-d';
    process.argv[3] = '--no-error';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getDeprecatedRules.called);
    assert.equal(exitStatus, 0);
  });

  it('logs verbosely', () => {
    process.argv[2] = '-c';
    process.argv[3] = '-v';
    proxyquire('../../src/bin/find', stub);
    assert.ok(getCurrentRules.called);
  });

  it('logs core rules', () => {
    stub = {
      '../lib/rule-finder'(specifiedFile, options) {
        return {
          getCurrentRules() {
            assert(!options.omitCore);
            return ['current', 'rules'];
          }
        };
      }
    };
    process.argv[2] = '-c';
    proxyquire('../../src/bin/find', stub);
  });

  it('does not log core rules with --no-core', () => {
    stub = {
      '../lib/rule-finder'(specifiedFile, options) {
        return {
          getCurrentRules() {
            assert(options.omitCore);
            return ['current', 'rules'];
          }
        };
      }
    };
    process.argv[2] = '-c';
    process.argv[3] = '--no-core';
    proxyquire('../../src/bin/find', stub);
  });

  it('does not include deprecated rules by default', () => {
    stub = {
      '../lib/rule-finder'(specifiedFile, options) {
        return {
          getAllAvailableRules() {
            assert(!options.includeDeprecated);
            return ['current', 'rules'];
          }
        };
      }
    };
    process.argv[2] = '-a';
    proxyquire('../../src/bin/find', stub);
  });

  it('includes deprecated rules with --include deprecated', () => {
    stub = {
      '../lib/rule-finder'(specifiedFile, options) {
        return {
          getAllAvailableRules() {
            assert(options.includeDeprecated);
            return ['current', 'rules'];
          }
        };
      }
    };
    process.argv[2] = '-a';
    process.argv[3] = '--include=deprecated';
    proxyquire('../../src/bin/find', stub);
  });

  it('includes deprecated rules with -i deprecated', () => {
    stub = {
      '../lib/rule-finder'(specifiedFile, options) {
        return {
          getAllAvailableRules() {
            assert(options.includeDeprecated);
            return ['current', 'rules'];
          }
        };
      }
    };
    process.argv[2] = '-a';
    process.argv[3] = '-i';
    process.argv[4] = 'deprecated';
    proxyquire('../../src/bin/find', stub);
  });
});
