function difference(a, b) {
  return a.filter(item => !b.includes(item)).sort((a, b) => a > b);
}

module.exports = difference;
