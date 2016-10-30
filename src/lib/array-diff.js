function difference(a, b) {
  const hash = {};
  const diff = {};

  b.forEach(item => {
    hash[item] = true;
  });

  a.forEach(item => {
    if (!hash[item] && !diff[item]) {
      diff[item] = true;
    }
  });

  return Object.keys(diff);
}

module.exports = difference;
