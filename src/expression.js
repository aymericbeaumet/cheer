import { transform } from 'babel-core'

/**
 * Leverage the Babel toolchain to apply several transformations. See the
 * plugins documentation below.
 * @param {String} expression - the expression to expand
 * @return {String} - the expanded expression
 */
export function expand(expression) {
  return transform(expression, {
    babelrc: false,
    comments: false,
    compact: true,
    plugins: [
      identifierToCallExpression,
      binaryExpressionToCallExpression,
    ],
  }).code
}

/**
 * Transform the Identifier's which are not callee of a CallExpression into a
 * CallExpression. Syntactic sugar for `a.pipe(b).pipe(c)` instead of `a().pipe(b()).pipe(c())`
 */
function identifierToCallExpression({ types: t }) {
  return {
    visitor: {
      Identifier: {
        enter(path) {
        },
      },
    },
  }
}

/**
 * Tranform the `|` binary operator between two CallExpression's to a `.pipe()`
 * call. Syntactic sugar for `a() | b() | c()` instead of `a().pipe(b()).pipe(c())`
 */
function binaryExpressionToCallExpression({ types: t }) {
  return {
    visitor: {
      BinaryExpression: {
        exit(path) {
          if (t.isBinaryExpression(path.node, { operator: '|' }) &&
              t.isCallExpression(path.node.left) &&
              t.isCallExpression(path.node.right)) {
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
