const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const consoleLog = console.log;
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
      async '../lib/rule-finder'() {
        return {
          getCurrentRules,
          getPluginRules,
          getAllAvailableRules,
          getUnusedRules,
          getDeprecatedRules
        };
      }
    };

    console.log = (...args) => {
      if (args[0].match(/(current|plugin|all-available|unused|deprecated|rules found)/)) {
        return;
      }
      consoleLog(...args);
    };
    exitStatus = new Promise(resolve => {
      process.exit = resolve;
    });
    process.argv = process.argv.slice(0, 2);
  });

  afterEach(() => {
    console.log = consoleLog;
    process.exit = processExit;
    // Purge yargs cache
    delete require.cache[require.resolve('yargs')];
  });

  it('no option', async () => {
    let callCount = 0;
    console.log = (...args) => {
      callCount += 1;
      if (args[0].match(
        /(no option provided, please provide a valid option|usage:|eslint-find-rules \[option] <file> \[flag])/)
      ) {
        return;
      }
      consoleLog(...args);
    };
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.equal(callCount, 3);
  });

  it('option -c|--current', async () => {
    process.argv[2] = '-c';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getCurrentRules.called);
  });

  it('option -p|--plugin', async () => {
    process.argv[2] = '-p';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getPluginRules.called);
  });

  it('option -a|--all-available', async () => {
    process.argv[2] = '-a';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getAllAvailableRules.called);
    process.argv[2] = '--all-available';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getAllAvailableRules.called);
  });

  it('option -a along with --ext', async () => {
    process.argv[2] = '-a';
    process.argv[3] = '--ext .json';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getAllAvailableRules.called);
  });

  it('option -a along with multi --ext', async () => {
    process.argv[2] = '-a';
    process.argv[3] = '--ext .js';
    process.argv[4] = '--ext .json';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getAllAvailableRules.called);
  });

  it('option -u|--unused', async () => {
    process.argv[2] = '-u';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 1);
    assert.ok(getUnusedRules.called);
  });

  it('options -u|--unused and no unused rules found', async () => {
    getUnusedRules.returns([]);
    process.argv[2] = '-u';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getUnusedRules.called);
  });

  it('option -u|--unused along with -n', async () => {
    process.argv[2] = '-u';
    process.argv[3] = '-n';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getUnusedRules.called);
  });

  it('option -u|--unused along with --no-error', async () => {
    process.argv[2] = '-u';
    process.argv[3] = '--no-error';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getUnusedRules.called);
  });

  it('option -d|--deprecated', async () => {
    process.argv[2] = '-d';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 1);
    assert.ok(getDeprecatedRules.called);
  });

  it('options -d|--deprecated and no deprecated rules found', async () => {
    getDeprecatedRules.returns([]);
    process.argv[2] = '-d';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getDeprecatedRules.called);
  });

  it('option -d|--deprecated along with -n', async () => {
    process.argv[2] = '-d';
    process.argv[3] = '-n';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getDeprecatedRules.called);
  });

  it('option -d|--deprecated along with --no-error', async () => {
    process.argv[2] = '-d';
    process.argv[3] = '--no-error';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getDeprecatedRules.called);
  });

  it('logs verbosely', async () => {
    process.argv[2] = '-c';
    process.argv[3] = '-v';
    proxyquire('../../src/bin/find', stub);
    assert.strictEqual(await exitStatus, 0);
    assert.ok(getCurrentRules.called);
  });

  it('logs core rules', async () => {
    stub = {
      async '../lib/rule-finder'(specifiedFile, options) {
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
    assert.strictEqual(await exitStatus, 0);
  });

  it('does not log core rules with --no-core', async () => {
    stub = {
      async '../lib/rule-finder'(specifiedFile, options) {
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
    assert.strictEqual(await exitStatus, 0);
  });

  it('does not include deprecated rules by default', async () => {
    stub = {
      async '../lib/rule-finder'(specifiedFile, options) {
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
    assert.strictEqual(await exitStatus, 0);
  });

  it('includes deprecated rules with --include deprecated', async () => {
    stub = {
      async '../lib/rule-finder'(specifiedFile, options) {
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
    assert.strictEqual(await exitStatus, 0);
  });

  it('includes deprecated rules with -i deprecated', async () => {
    stub = {
      async '../lib/rule-finder'(specifiedFile, options) {
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
    assert.strictEqual(await exitStatus, 0);
  });
});
