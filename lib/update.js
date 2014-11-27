module.exports = {
    suite: remove_suite
  , test: test
  , done: done
  , guard_arg: guard_arg
  , strictEqual: strictEqual
}

function remove_suite(node) {
  var children
  var new_source

  children = node.arguments[1].body.body

  new_source = children.reduce(function(a, b) {
    return a + b.source()
  }, '')

  new_source.replace(/^ {2}/m, '')

  node.update(new_source)
}

function test(node) {
  // start from the beginning of the string, find the first set of parens and
  // remember what was in them.
  var ARG_REGEX = /\(.*?\)/

  var new_source = node.source().replace(ARG_REGEX, '(assert)')

  var lines
  var indent

  if(new_source.indexOf('assert.end') < 0) {
    lines = new_source.split('\n')
    indent = /^ */.exec(lines[lines.length - 2])[0]
    lines[lines.length - 2] = lines[lines.length - 2] +
      '\n' +
      indent +
      'assert.end()'

    new_source = lines.join('\n')
  }

  node.update(new_source)
}

function guard_arg(node) {
  node.update('assert.end.bind(assert)')
}

function done(node) {
  node.callee.update('assert.end')
}

function strictEqual(node) {
  node.update('equal')
}
