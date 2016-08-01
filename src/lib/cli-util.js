var getRuleURI = require('eslint-rule-documentation')
var size = require('window-size')
var availableWidth = size.width || /*istanbul ignore next */ 80
var ui = require('cliui')({width: availableWidth})

function push(output, columns) {
  var _output = [].concat(output)

  var padding = {top: 0, right: 2, bottom: 0, left: 0}
  var width = _output.reduce(
    function getMaxWidth(previous, current) {
      return Math.max(padding.left + current.length + padding.right, previous)
    }, 0)

  var _columns = columns || Math.floor(availableWidth / width)
  var cellMapper = getOutputCellMapper(Math.floor(availableWidth / _columns), padding)

  while (_output.length) {
    ui.div.apply(ui, _output.splice(0, _columns).map(cellMapper))
  }
}

function verbosePush(output) {
  var _output = [].concat(output).map(function(rule) {
    return rule + '\t' + getRuleURI(rule).url
  })

  push(_output, 1)
}

function write(logger) {
  var _logger = logger || console
  var _log = _logger.log || /* istanbul ignore next */ console.log // eslint-disable-line no-console
  _log(ui.toString())
}

function getOutputCellMapper(width, padding) {
  return function curriedOutputCellMapper(text) {
    return {
      text: text,
      width: width,
      padding: [padding.top, padding.right, padding.bottom, padding.left],
    }
  }
}

module.exports = {
  push: push,
  verbosePush: verbosePush,
  write: write,
}
