function flattenRulesDiff(diff) {
  if (Array.isArray(diff)) {
    return flattenRulesDiffArray(diff);
  } else if (typeof diff === 'object') {
    return flattenRulesDiffObject(diff);
  }

  return [];
}

function flattenRulesDiffObject(diffObject) {
  const flattened = [];

  Object.keys(diffObject).forEach(ruleName => {
    const diff = diffObject[ruleName];
    const ruleRow = [ruleName].concat(
      Object.keys(diff).map(configName => diff[configName])
    );

    flattened.push(...ruleRow);
  });

  return flattened;
}

function flattenRulesDiffArray(diffArray) {
  const flattened = [];

  diffArray.forEach(diff => {
    flattened.push(...flattenRulesDiff(diff));
  });

  return flattened;
}

module.exports = flattenRulesDiff;
