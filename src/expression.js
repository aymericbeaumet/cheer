import { transform } from 'babel-core'

/**
 * Leverage the Babel toolchain to:
 *   - transform the pipe binary operator between CallExpression to `.pipe()`
 * @param {String} expression - the expression to expand
 * @return {String} - the expanded expression
 */
export function expand(expression) {
  return transform(expression, {
    babelrc: false,
    comments: false,
    compact: true,
    plugins: [
      babelPluginPipeOperatorToPipeExpression,
    ],
  }).code
}

function babelPluginPipeOperatorToPipeExpression({ types: t }) {
  return {
    visitor: {
      BinaryExpression: {
        exit(path) {
          if (t.isBinaryExpression(path.node, { operator: '|' })) {
            path.replaceWith(t.callExpression(
              // callee
              t.memberExpression(
                // object
                path.node.left,
                // property
                t.identifier('pipe'),
                // computed
                false
              ),
              // arguments
              [ path.node.right ]
            ))
          }
        },
      },
    },
  }
}
