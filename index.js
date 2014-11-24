var falafel = require('falafel')
  , concat = require('concat-stream')
  , through = require('through')
  , duplexer = require('duplexer')
  , Checks = require('./lib/checks')

module.exports = drive_to_tape

function drive_to_tape() {
  var stream = through()

  var processor = concat(on_source)

  return duplexer(processor, stream)

  function on_source(src) {
    src = src.toString()
    src = 'var test = require(\'tape\') \n ' + src

    var checks = Checks(src)

    var res = falafel(src, transform)

    stream.queue(res)
    stream.queue(null)

    function transform(node) {
      checks.remove_suite(node)
      checks.update_test_arguments(node)
    }
  }
}

