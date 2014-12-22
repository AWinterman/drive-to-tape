module.exports = {
    suite: check(is_suite)
  , inline_test: check(is_inline_test_function)
  , outline_test: check(is_out_of_line_test)
  , done: check(is_done)
  , guard_done_arg: check(is_guard_done_arg)
  , strictEqual: check(is_strictEqual)
  , declaration_of: is_declaration_of
  , html: check(is_html)
  , endpoints: check(is_endpoints)
  , check: check
}

function is_suite(node) {
  return node.type === 'CallExpression' &&
    node.callee &&
    node.callee.name === 'suite'
}

function is_inline_test_function(node) {
  return node.parent &&
    node.parent.type === 'CallExpression' &&
    node.parent.callee &&
    node.parent.callee.name === 'test' &&
    node.type === 'FunctionExpression'
}

function is_out_of_line_test(node) {
  return node &&
    node.type === 'CallExpression' &&
    node.callee &&
    node.callee.name === 'test' &&
    node.arguments[1].type === 'Identifier'
}

function has_parent(_node, test, options) {
  var stop
  var node = _node

  options = options || {}

  while(node.parent) {
    stop = test(node.parent)

    if(stop) {
      return true
    }

    if(options.immediate) {
      return false
    }

    node = node.parent
  }

  return false
}

function is_done(node) {
  return node &&
    node.type === 'CallExpression' &&
    node.callee &&
    node.callee.name === 'done'
}

function is_guard_done_arg(node) {
  return node &&
    node.parent &&
    node.parent.type === 'CallExpression' &&
    node.parent.callee &&
    node.parent.callee.name === 'guard' &&
    node.name === 'done'
}

function is_strictEqual(node) {
  return node.name === 'strictEqual' &&
    node.parent.type === 'MemberExpression' &&
    node.parent.object.name === 'assert'
}

function is_declaration_of(target, candidate) {
  return candidate && candidate.type && candidate.type === 'FunctionDeclaration' &&
    candidate.id && candidate.id.name === target.name
}

function is_html(node) {
  return node.type === 'CallExpression' &&
    node.callee &&
    node.callee.name === 'html'
}

function is_endpoints(node) {
  return node.type === 'CallExpression' &&
    node.callee &&
    node.callee.name === 'endpoints'
}

function check(test_fn) {
  return function(node, update) {
    if(!test_fn(node)) {
      return null
    }

    return update(node)
  }
}
