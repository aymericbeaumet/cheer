import { transform, transformFromAst } from 'babel-core'
import * as t from 'babel-types'
import { isEmpty, sortBy } from 'lodash'

/**
 * Leverage the Babel toolchain to sequentially apply transformations. Return an
 * array of string, split by root ExpressionStatement. See the plugins
 * documentation below.
 * @param {String} code - the code to expand
 * @return {String} - the expanded code
 */
export function expand(code) {
  const pluginsSequence = [
    prependDirectivesAsStringLiteral,
    allowIdentifierAsCallExpression,
    allowPipeOperatorAsStreamPipe,
    wrapLiteral,
  ]
  const finalAst = pluginsSequence.reduce((ast, plugin) => {
    return transformFromAst(ast, null, babelOptions({ code: false, plugins: [ plugin ] })).ast
  }, transform(code, babelOptions()).ast)
  return finalAst.program.body.map(expressionStatement => {
    if (!t.isExpressionStatement(expressionStatement)) {
      throw new ExpressionError('Only ExpressionStatement are allowed as the root nodes')
    }
    return transformFromNode(expressionStatement, null, babelOptions()).code
  })
}

/**
 * Reinject the Directive's as StringLiteral's.
 */
export function prependDirectivesAsStringLiteral() {
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
 * Tranform the `|` binary operator between two CallExpression or Identifier
 * into a `.pipe()` call.
 * Syntactic sugar for `a() | b()` instead of `a().pipe(b())`
 */
export function allowPipeOperatorAsStreamPipe() {
  return {
    visitor: {
      BinaryExpression: {
        exit(path) {
          if (t.isBinaryExpression(path.node, { operator: '|' }) &&
              t.isCallExpression(path.node.left) &&
              t.isCallExpression(path.node.right)) {
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

/**
 * Transform the Identifier which are not callee of a CallExpression into a
 * CallExpression.
 * Syntactic sugar for `a` instead of `a()`
 */
export function allowIdentifierAsCallExpression() {
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
 */
export function wrapLiteral() {
  const wrap = node => {
    switch (node.type) {
      case 'ArrayExpression':
      case 'BooleanLiteral':
      case 'NullLiteral':
      case 'NumericLiteral':
      case 'ObjectExpression':
      case 'RegExpLiteral':
      case 'StringLiteral':
      case 'UnaryExpression': {
        const callee = t.identifier('raw')
        const args = [
          node,
        ]
        return t.callExpression(callee, args)
      }
      case 'TemplateLiteral': {
        const callee = t.identifier(isEmpty(node.expressions) ? 'raw' : 'template')
        const args = [
          t.stringLiteral(
            transformFromNode(node, null, babelOptions())
              .code
              .slice(
                +Number('`'.length),
                -Number('`\n'.length)
              )
          ),
        ]
        return t.callExpression(callee, args)
      }
      default:
        return node
    }
  }
  return {
    visitor: {
      BinaryExpression(path) {
        path.node.left = wrap(path.node.left)
        path.node.right = wrap(path.node.right)
      },
      Program(path) {
        path.node.body = path.node.body.map(child => {
          if (t.isExpressionStatement(child)) {
            return t.expressionStatement(wrap(child.expression))
          }
          return child
        })
      },
    },
  }
}

function babelOptions(...args) {
  return Object.assign({
    babelrc: false,
    comments: false,
    compact: true,
    minified: true,
  }, ...args)
}

function transformFromNode(node, code = null, options = {}) {
  const ast =
    t.file(
      t.program([
        t.isExpressionStatement(node) ? node : t.expressionStatement(node),
      ]),
      null,
      null
    )
  return transformFromAst(ast, code, options)
}

function ExpressionError(message) {
  const error = new Error(message)
  error.name = 'ExpressionError'
  return error
}
