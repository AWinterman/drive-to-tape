var falafel = require('falafel')
  , concat = require('concat-stream')
  , through = require('through')
  , duplexer = require('duplexer')

var checks = require('./lib/checks')
var update = require('./lib/update')

module.exports = drive_to_tape

function drive_to_tape() {
  var stream = through()

  var processor = concat(on_source)

  return duplexer(processor, stream)

  function on_source(src) {
    src = src.toString()
    src = 'var test = require(\'tape\') \n\n' + src

    var result
    var out_line_tests = []

    result = falafel(src, function(node) {
      checks.suite(node, update.suite)
    }).toString()

    result = falafel(result, function(node) {
      checks.done(node, update.done)
    }).toString()

    result = falafel(result, function(node) {
      checks.inline_test(node, update.test)
    }).toString()

    result = falafel(result, function(node) {
      checks.guard_done_arg(node, update.guard_arg)
    }).toString()

    result = falafel(result, function(node) {
      checks.strictEqual(node, update.strictEqual)
    }).toString()

    result = falafel(result, function(node) {
      checks.outline_test(node, function(node) {
        out_line_tests.push(node)
      })
    }).toString()

    var target

    for(var i = 0, len = out_line_tests.length; i < len; ++i) {
      target = out_line_tests[i].arguments[1]
      result = falafel(result, update_out_of_line_test_definition(target)).toString()
    }

    function update_out_of_line_test_definition(target) {
      return function(node) {
        if(!checks.declaration_of(target, node)) {
          return
        }

        update.test(node)
      }
    }

    stream.end(result)
  }
}

function find_declaration(node) {
  node.parent
}
