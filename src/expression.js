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
    sourceMaps: 'inline',
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
export function identifierToCallExpression({ types }) {
  const helper = helperIdentifierToCallExpression({ types })
  return {
    visitor: {
      BinaryExpression(path) {
        path.node.left = helper(path.node.left)
        path.node.right = helper(path.node.right)
      },
      CallExpression(path) {
        path.node.arguments = path.node.arguments.map(helper)
      },
      MemberExpression(path) {
        path.node.object = helper(path.node.object)
      },
    },
  }
}

/**
 * Tranform the `|` binary operator between two CallExpression's into a
 * `.pipe()` call. Syntactic sugar for `a() | b() | c()` instead of
 * `a().pipe(b()).pipe(c())`
 */
export function binaryExpressionToCallExpression({ types: t }) {
  return {
    visitor: {
      BinaryExpression: {
        exit(path) {
          if (t.isBinaryExpression(path.node, { operator: '|' }) &&
              t.isCallExpression(path.node.left) &&
              t.isCallExpression(path.node.right)) {
            const calleeObject = path.node.left
            const calleeProperty = t.identifier('pipe')
            const calleeComputed = false
            const callee = t.memberExpression(
              calleeObject,
              calleeProperty,
              calleeComputed
            )
            const args = [ path.node.right ]
            path.replaceWith(t.callExpression(callee, args))
          }
        },
      },
    },
  }
}

/**
 */
function helperIdentifierToCallExpression({ types: t }) {
  return function helper(identifier) {
    const callee = identifier
    const args = []
    return t.isIdentifier(identifier) ? t.callExpression(callee, args) : identifier
  }
}
