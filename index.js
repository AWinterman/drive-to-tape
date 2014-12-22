var falafel = require('falafel')
  , concat = require('concat-stream')
  , through = require('through')
  , duplexer = require('duplexer')
  , util = require('util')

var checks = require('./lib/checks')
var update = require('./lib/update')

module.exports = drive_to_tape

function drive_to_tape(logger) {
  var stream = through()

  var processor = concat(on_source)

  return duplexer(processor, stream)

  function on_source(src) {
    src = src.toString()

    var result
    var out_line_tests = []

    // iteration variables:
    var spec
    var len
    var i

    var transformSpecifications = [
        {
            name: 'suite'
          , check: checks.suite
          , update: update.suite
        }
      , {
            name: 'done'
          , check: checks.done
          , update: update.done
        }
      , {
            name: 'inline tests'
          , check: checks.inline_test
          , update: update.test
        }
      , {
            name: 'guard\'s "done" argument'
          , check: checks.guard_done_arg
          , update: update.guard_arg
        }
      , {
            name: 'strictEqual'
          , check: checks.strictEqual
          , update: update.strictEqual
        }
      , {
            name: 'setting up out of line tests'
          , check: checks.outline_test
          , update: out_line_tests.push.bind(out_line_tests)
          , after: addDependents
        }
    ]

    result = 'var test = require(\'tape\') \n\n' + src

    do {
      spec = transformSpecifications.shift()

      try {
        result = falafel(
            result
          , spec.options || {}
          , onnode(spec.check, spec.update)
        ).toString()

        logger.info('finished transform %s', spec.name)

        if(spec.after) {
          spec.after()
        }
      } catch(e) {
        logger.error(
            'encountered "%s" applying transform %s'
          , e.stack
          , spec.name
        )
      }
    } while(transformSpecifications.length)

    stream.end(result)

    function addDependents() {
      // some transforms depend on the results of previous iterations of the
      // AST

      var target

      for(i = 0, len = out_line_tests.length; i < len; ++i) {
        logger.debug(out_line_tests[i])
        target = out_line_tests[i].arguments[1]

        logger.debug(target.source())

        transformSpecifications.push({
            name: util.format('%s-th out of line test', i)
          , check: checks.check(checks.declaration_of.bind(checks, target))
          , update: update.test
        })
      }

      // finally look for the expressions we cannot transform
      transformSpecifications.push({
          name: 'check for html call'
        , check: checks.html
        , update: logHTML
        , options: {loc: true}
      })
      transformSpecifications.push({
          name: 'check for endpoints call'
        , check: checks.endpoints
        , update: logEndpoints
        , options: {loc: true}
      })
    }
  }

  function logHTML(node) {
    logger.warn('found html call on line %s', node.loc.start.line)
  }

  function logEndpoints(node) {
    logger.warn('found endpoints call on line %s', node.loc.start.line)
  }

  function onnode(check, update) {
    return function(node) {
      check(node, update)
    }
  }
}
