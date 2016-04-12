function difference(a, b) {
  var hash = {}
  var diff = {}

  b.forEach(function createHash(item) {
    hash[item] = true
  })

  a.forEach(function findDiff(item) {
    if (!hash[item] && !diff[item]) {
      diff[item] = true
    }
  })

  return Object.keys(diff)

}

module.exports = difference
