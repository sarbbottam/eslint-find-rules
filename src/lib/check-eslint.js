const path = require('path');
const semver = require('semver');

const requiredVersion = getRequiredEslintVersion();

function getEslint() {
  try {
    return require('eslint');
  } catch (err) {
    /* istanbul ignore if */
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    }
  }
  return null;
}

function getEslintVersion() {
  const eslint = getEslint();

  if (eslint === null ||
    !eslint.CLIEngine) {
    return null;
  }

  return eslint.CLIEngine.version;
}

function getRequiredEslintVersion() {
  const jsonPath = path.resolve(__dirname, '..', '..', 'package.json');
  const packageJson = require(jsonPath);
  return packageJson.peerDependencies.eslint;
}

function check() {
  const foundVersion = getEslintVersion();

  if (!semver.valid(foundVersion)) {
    return false;
  }

  return semver.satisfies(foundVersion, requiredVersion);
}

module.exports = {
  check,
  requiredVersion
};
