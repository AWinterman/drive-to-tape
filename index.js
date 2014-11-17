var lang = require('cssauron-falafel')
  , falafel = require('falafel')
  , concat = require('concat-stream')
  , through = require('through')
  , path = require('path')
  , fs = require('fs')
  , serialize = require('escodegen').generate
  , esprima = require('esprima')
  , jsfmt = require('jsfmt')
  , duplexer = require('duplexer')

var jsfmtrc = jsfmt.getConfig();

// We're going to generate some code, guys.
var escodegen_options = {}
escodegen_options.format = {}
escodegen_options.format.indent = {}
escodegen_options.format.indent.style = '  '
escodegen_options.format.indent.base = 0
escodegen_options.format.quotes = 'single'
escodegen_options.format.semicolons = false

var is_suite = lang('call:contains(suite)')
  , is_first_statement = lang('call:contains(suite) > * > block variable-decl')
  , is_function_call_after_test = lang(
      'call:contains(suite) call:contains(test) > literal + function'
    )
  , is_function_body_after_test = lang(
      'call:contains(suite) call:contains(test) > literal + function > block'
    )
  , is_variable_name_after_test = lang('call:contains(test) > literal + id')
  , is_strict_equal = lang('lookup > id[name=assert] + id[name=strictEqual]')
  , has_done = lang('call:contains(test) call > [name=done]')
  , is_return = lang('return')

module.exports = drive_to_tape

function drive_to_tape() {
  var stream = through()

  var processor = concat(on_source)

  return duplexer(processor, stream)

  function on_source(src) {
    var res

    res = falafel(
        src.toString()
      , first_pass_transform
    ).toString()

    res = falafel(
        res
      , second_pass_transform
    ).toString()

    stream.queue(res)
  }
}

var named_tests = []

function is_named_test_block(named_tests, node) {
  return lang('block')(node) &&
    node.parent.id &&
    named_tests.indexOf(node.parent.id.name) > -1
}

function second_pass_transform(node) {
  if(is_named_test_block(named_tests, node)) {
    add_end_if_no_done(node)
  }

  if(node.id && (named_tests.indexOf(node.id.name) > -1)) {
    node.params = [{
        type: 'Identifier'
      , name: 'assert'
    }]

    options = JSON.parse(JSON.stringify(escodegen_options))
    options.format.indent.base = 1

    node.update(serialize(node, options))

    return
  }
}

function first_pass_transform(node) {
  var suite = is_suite(node)
    , first_statement = is_first_statement(node)
    , function_call_after_test = is_function_call_after_test(node)
    , done = has_done(node)
    , variable_name_after_test = is_variable_name_after_test(node)

  if(suite) {
    return node.update(
        ';(function() ' + node.arguments[1].body.source() + ')()'
    )
  }

  if(first_statement) {
    // AST node so we can put it with the first group of declarations.
    var require_tape = esprima.parse("test = require('tape')")

    node.declarations.unshift(require_tape)

    return node.update(
        jsfmt.format(serialize(node, escodegen_options), jsfmtrc).replace(';', '\n')
    )
  }

  if(function_call_after_test) {
    return correct_arguments(node)
  }

  if(is_function_body_after_test(node)) {
    return add_end_if_no_done(node)
  }

  if(done) {
    return replace_dones(node)
  }

  if(variable_name_after_test) {
    return named_tests.push(node.source())
  }
  if(is_strict_equal(node) ) {
    return strict_equal_to_equal(node)
  }
}

function correct_arguments(node, str) {
  node.update(
    node.source().replace(/function\((done)?/, 'function(assert')
  )
}

function replace_dones(node) {
  if(node.parent.arguments.length) {
    node.update('assert.fail')
  } else {
    node.update('assert.end')
  }
}

function strict_equal_to_equal(node) {
  node.name = 'equal'
  node.update(serialize(node))
}

function add_end_if_no_done(node) {
  if(node.source().indexOf('done') !== -1) {
    return
  }

  var found = false

  var end = esprima.parse('assert.end()')

  for(var i = 0, len = node.body.length; i < len; ++i) {
    if(is_return(node.body[i])) {
      found = true

      node.body.splice(i, 0, end)

      break
    }
  }

  if(!found) {
    node.body.push(end)
  }

  node.update(serialize(node))

  return node
}
