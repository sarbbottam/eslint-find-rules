/* istanbul ignore file: ignore from coverage because it varies per eslint version */

let eslintNaming;

function _getNormalizer() {
  if (eslintNaming) {
    return eslintNaming;
  }

  const eslintVersionFunctions = [
    // eslint >= 7.8.0
    function () {
      const ESLintExports = require('eslint');

      const version = ESLintExports.ESLint.version;

      if (!version) {
        throw new Error('Unable to find eslint version');
      }

      const ESLintRC = require('@eslint/eslintrc');

      const naming = ESLintRC.Legacy.naming;

      return {
        normalizePackageName: naming.normalizePackageName,
        getShorthandName: naming.getShorthandName
      }
    },
    // eslint >= 6.1.0
    function () {
      const normalizer = require('eslint/lib/shared/naming');

      return {
        normalizePackageName: normalizer.normalizePackageName,
        getShorthandName: normalizer.getShorthandName
      };
    },
  ];

  for (const tryEslintVersion of eslintVersionFunctions) {
    try {
      const normalizer = tryEslintVersion();

      if (
        typeof normalizer.normalizePackageName === 'function' &&
        typeof normalizer.getShorthandName === 'function'
      ) {
        eslintNaming = {
          normalizePackageName: normalizer.normalizePackageName,
          getShorthandName: normalizer.getShorthandName
        };

        return eslintNaming;
      }
    // eslint-disable-next-line no-unused-vars, no-empty
    } catch (err) {
    }
  }

  throw new Error('eslint naming functions not found');
}

function normalizePluginName(name) {
  const normalizer = _getNormalizer();

  const module = normalizer.normalizePackageName(name, 'eslint-plugin');
  const prefix = normalizer.getShorthandName(name, 'eslint-plugin');

  return {module, prefix};
}

module.exports = normalizePluginName;
