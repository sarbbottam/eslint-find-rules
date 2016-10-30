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
    const ruleRow = [ruleName];
    const diff = diffObject[ruleName];

    Object.keys(diff).forEach(configName => {
      ruleRow.push(diff[configName]);
    });

    flattened.push.apply(flattened, ruleRow);
  });

  return flattened;
}

function flattenRulesDiffArray(diffArray) {
  const flattened = [];

  diffArray.forEach(diff => {
    flattened.push.apply(flattened, flattenRulesDiff(diff));
  });

  return flattened;
}

module.exports = flattenRulesDiff;
