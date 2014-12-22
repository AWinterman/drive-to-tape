var Logger = require('../lib/Logger')
var tape = require('tape')
var through = require('through')
var concat = require('concat-stream')

tape('logs at the appropriate level', function(t) {
  var stream = through()

  var expected = [
      'INFO: goodbye'
    , 'WARN: watch out!'
    , 'ERROR: oh noes'
  ].join('\n') + '\n'

  var results = concat(function(data) {
    t.equal(
        data.replace(/ \(.*?\)/g, '')
      , expected
    )

    t.end()
  })

  var logger = new Logger('INFO', stream)

  stream.pipe(results)

  logger.debug('hello')
  logger.info('goodbye')
  logger.warn('watch out!')
  logger.error('oh noes')

  stream.end()
})
