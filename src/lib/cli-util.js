var size = require('window-size')
var availableWidth = size.width || /*istanbul ignore next */ 80
var ui = require('cliui')({width: availableWidth})

function push(output, columns, uniformColWidths) {
  var _output = [].concat(output)

  var padding = {top: 0, right: 2, bottom: 0, left: 0}
  var maxWidth = [_output.reduce(
    function getMaxWidth(previous, current) {
      return Math.max(padding.left + current.length + padding.right, previous)
    }, 0)]

  var _columns = columns || Math.floor(availableWidth / maxWidth)
  var cellMapper, widths

  if (uniformColWidths === false && _columns > 1) {
    widths = []
    _output.forEach(function(content, index) {
      widths[index % _columns] = Math.max(
        padding.left + content.length + padding.right,
        widths[index % _columns] || 0
      )
    })
  } else {
    widths = [Math.floor(availableWidth / _columns)]
  }

  cellMapper = getOutputCellMapper(widths, padding)

  while (_output.length) {
    ui.div.apply(ui, _output.splice(0, _columns).map(cellMapper))
  }
}

function write(logger) {
  var _logger = logger || console
  var _log = _logger.log || /* istanbul ignore next */ console.log // eslint-disable-line no-console
  _log(ui.toString())
}

function getOutputCellMapper(widths, padding) {
  return function curriedOutputCellMapper(text, index) {
    var _width = widths[index]
    if (_width === undefined) {
      _width = widths[0]
    }
    return {
      text: text,
      width: _width,
      padding: [padding.top, padding.right, padding.bottom, padding.left],
    }
  }
}

module.exports = {
  push: push,
  write: write,
}
