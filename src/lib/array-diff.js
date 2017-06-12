function difference(a, b) {
  return a.filter(item => b.indexOf(item) === -1).sort((a, b) => a > b);
}

module.exports = difference;
