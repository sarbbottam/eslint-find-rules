const eslintrc = require('./eslintrc');
const merge = require('lodash/merge');

module.exports = merge(eslintrc, {
  rules: {
    'bar-rule': [2]
  }
});
