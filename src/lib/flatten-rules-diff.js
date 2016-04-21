function flattenRulesDiff(diff) {
  if (Array.isArray(diff)) {
    return flattenRulesDiffArray(diff)
  } else if (typeof diff === 'object') {
    return flattenRulesDiffObject(diff)
  }

  return []
}

function flattenRulesDiffObject(diffObject) {
  var flattened = []

  Object.keys(diffObject).forEach(function flattenEachRuleDiff(ruleName) {
    var ruleRow = [ruleName]
    var diff = diffObject[ruleName]

    Object.keys(diff).forEach(function flattenEachChildProp(configName) {
      ruleRow.push(diff[configName])
    })

    flattened.push.apply(flattened, ruleRow)
  })

  return flattened
}

function flattenRulesDiffArray(diffArray) {
  var flattened = []

  diffArray.forEach(function flattenEachDiff(diff) {
    flattened.push.apply(flattened, flattenRulesDiff(diff))
  })

  return flattened
}

module.exports = flattenRulesDiff
