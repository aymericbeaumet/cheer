import { transform, transformFromAst } from 'babel-core'
import * as t from 'babel-types'
import { isEmpty, sortBy } from 'lodash'

/**
 * Leverage the Babel toolchain to apply several transformations. Also split by
 * root ExpressionStatement. See the plugins documentation below.
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
  return ast.program.body.map(expressionStatement => {
    if (!t.isExpressionStatement(expressionStatement)) {
      throw new ExpressionError('Only ExpressionStatement are allowed as the root nodes')
    }
    const root = t.file(
      t.program([
        expressionStatement,
      ]),
      null,
      null
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
 * Transform the Identifier which are not callee of a CallExpression into a
 * CallExpression.
 * Syntactic sugar for `a` instead of `a()`
 */
export function fromIdentifierToCallExpression() {
  const toCallExpression = identifier => {
    const callee = identifier
    const args = []
    return t.isIdentifier(identifier) ? t.callExpression(callee, args) : identifier
  }
  return {
    visitor: {
      BinaryExpression(path) {
        path.node.left = toCallExpression(path.node.left)
        path.node.right = toCallExpression(path.node.right)
      },
      CallExpression(path) {
        path.node.arguments = path.node.arguments.map(toCallExpression)
      },
      ExpressionStatement(path) {
        path.node.expression = toCallExpression(path.node.expression)
      },
      MemberExpression(path) {
        path.node.object = toCallExpression(path.node.object)
      },
    },
  }
}

  /**
   * Tranform the `|` binary operator between two CallExpression or Identifier
   * into a `.pipe()` call.
   * Syntactic sugar for `a() | b()` instead of `a().pipe(b())`
   */
export function fromBinaryExpressionToCallExpression() {
  const isCallExpressionOrIdentifier = node =>
    t.isCallExpression(node) || t.isIdentifier(node)
  return {
    visitor: {
      BinaryExpression: {
        exit(path) {
          if (t.isBinaryExpression(path.node, { operator: '|' }) &&
              isCallExpressionOrIdentifier(path.node.left) &&
              isCallExpressionOrIdentifier(path.node.right)) {
            path.replaceWith(t.callExpression(
              t.memberExpression(
                path.node.left,
                t.identifier('pipe'),
                false
              ),
              [ path.node.right ]
            ))
          }
        },
      },
    },
  }
}

function ExpressionError(message) {
  const error = new Error(message)
  error.name = 'ExpressionError'
  return error
}
