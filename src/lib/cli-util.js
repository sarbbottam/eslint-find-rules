const size = require('window-size');

const availableWidth = size.width || /* istanbul ignore next */ 80;
const ui = require('cliui')({width: availableWidth});

function push(output, columns, uniformColWidths) {
  const _output = [].concat(output);

  const padding = {top: 0, right: 2, bottom: 0, left: 0};
  const maxWidth = [_output.reduce((previous, current) => Math.max(padding.left + current.length + padding.right, previous), 0)];

  const _columns = columns || Math.floor(availableWidth / maxWidth);
  let widths;

  if (uniformColWidths === false && _columns > 1) {
    widths = [];
    _output.forEach((content, index) => {
      widths[index % _columns] = Math.max(
        padding.left + content.length + padding.right,
        widths[index % _columns] || 0
      );
    });
  } else {
    widths = [Math.floor(availableWidth / _columns)];
  }

  const cellMapper = getOutputCellMapper(widths, padding);

  while (_output.length) {
    ui.div(..._output.splice(0, _columns).map(cellMapper));
  }
}

function write(logger) {
  const _logger = logger || console;
  const _log = _logger.log || /* istanbul ignore next */ console.log;
  const output = ui.toString();

  // Only log when there is something to show
  if (output.length > 0) {
    _log(output);
  }
}

function getOutputCellMapper(widths, padding) {
  return (text, index) => {
    let _width = widths[index];
    if (_width === undefined) {
      _width = widths[0];
    }
    return {
      text,
      width: _width,
      padding: [padding.top, padding.right, padding.bottom, padding.left]
    };
  };
}

module.exports = {
  push,
  write
};
