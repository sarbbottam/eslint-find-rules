function stringifyRuleConfig(rule) {
  if (typeof rule === 'string') {
    return rule
  } else if (typeof rule === 'undefined') {
    return '-'
  }

  return JSON.stringify(rule)
}

module.exports = stringifyRuleConfig
