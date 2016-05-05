var which = require('which')
var modulePath, filePath

/* istanbul ignore next */
which('eslint-find-rules', function(error) {
  if (!error) {
    modulePath = require.resolve('eslint-find-rules').match(/.*eslint-find-rules/)[0]
    filePath = __filename.match(/.*eslint-find-rules/)[0]

    if (modulePath === filePath) {
      console.log( // eslint-disable-line no-console
        'eslint-find-rules and eslint-diff-rules are to be used as a local utility'
      )
    }
    process.exit(1)
  }
})
