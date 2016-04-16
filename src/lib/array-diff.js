function difference(a, b) {
  var hash = {}
  var diff = {}

  b.forEach(createHash(hash))
  a.forEach(findDiff(hash, diff))

  // return the other way round
  hash = {}
  a.forEach(createHash(hash))
  b.forEach(findDiff(hash, diff))

  return Object.keys(diff)

}

function createHash(hash) {
  return function curried(item) {
    hash[item] = true
  }
}

function findDiff(hash, diff) {
  return function curried(item) {
    if (!hash[item] && !diff[item]) {
      diff[item] = true
    }
  }
}

module.exports = difference
