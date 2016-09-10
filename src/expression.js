import { transform, transformFromAst } from 'babel-core'
import * as t from 'babel-types'
import { isEmpty, sortBy } from 'lodash'

/**
 * Leverage the Babel toolchain to apply several transformations. See the
 * plugins documentation below.
 * @param {String} code - the code to expand
 * @return {String} - the expanded code
 */
export function expand(code) {
  const options = {
    babelrc: false,
    comments: false,
    compact: true,
    minified: true,
  }
  const { ast } = transform(code, {
    ...options,
    code: false,
    plugins: [
      fromDirectiveToExpressionStatements,
      fromIdentifierToCallExpression,
      fromBinaryExpressionToCallExpression,
    ],
  })
  return ast.program.body.map(expression => {
    const root = t.file(
      t.program([ expression ]),
      ast.program.comments,
      ast.program.tokens,
    )
    return transformFromAst(root, null, options).code
  })
}

/**
 * Reinject the Directive's as StringLiteral's.
 */
export function fromDirectiveToExpressionStatements() {
  return {
    visitor: {
      Program(path) {
        if (isEmpty(path.node.directives)) {
          return
        }
        const directives = path.node.directives.map(directive => {
          const directiveLiteral = directive.value
          const stringLiteral = t.stringLiteral(directiveLiteral.value)
          const expression = t.expressionStatement(stringLiteral)
          expression.start = stringLiteral.start = directiveLiteral.start
          return expression
        })
        path.node.directives.length = 0
        path.node.body = sortBy([
          ...path.node.body,
          ...directives,
        ], 'start')
      },
    },
  }
}

/**
 * Transform the Identifier's which are not callee of a CallExpression into a
 * CallExpression. Syntactic sugar for `a.pipe(b).pipe(c)` instead of `a().pipe(b()).pipe(c())`
 */
export function fromIdentifierToCallExpression() {
  const helper = helperIdentifierToCallExpression()
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
      ExpressionStatement(path) {
        path.node.expression = helper(path.node.expression)
      },
    },
  }
}

/**
 * Tranform the `|` binary operator between two CallExpression's into a
 * `.pipe()` call. Syntactic sugar for `a() | b() | c()` instead of
 * `a().pipe(b()).pipe(c())`
 */
export function fromBinaryExpressionToCallExpression() {
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
function helperIdentifierToCallExpression() {
  return function helper(identifier) {
    const callee = identifier
    const args = []
    return t.isIdentifier(identifier) ? t.callExpression(callee, args) : identifier
  }
}
