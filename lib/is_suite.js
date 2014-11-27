module.exports.is_suite = function(node) {
  return node.type === 'ExpressionStatement' &&
    node.expression &&
    node.expression.name === 'suite'
}
