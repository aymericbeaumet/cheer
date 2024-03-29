import {Duplex, Readable, Transform} from 'stream'
import {runInNewContext} from 'vm'
import {transform, transformFromAst} from 'babel-core'
import * as t from 'babel-types'
import getStream from 'get-stream'
import {isEmpty, sortBy} from 'lodash'

const STREAM_PIPE = 'pipe'
const PLUGIN_RAW = 'raw'
const PLUGIN_TEMPLATE = 'template'
const PLUGIN_STRINGIFY = 'stringify'

/**
 * Interpret the given expression.
 * @param {String} expression - the expression to interpret
 * @param {Object=} options
 * @param {Object=} options.plugins - the plugins the expression is allowed to
 * access
 */
export function interpret(expression, {
  plugins = {}
} = {}) {
  const code = expression
  const context = {
    ...plugins
  }
  const stream = runInNewContext(code, context)
  if (!(stream instanceof Duplex || stream instanceof Readable || stream instanceof Transform)) {
    return Promise.reject(new Error('The stream should either be a Duplex, a Readable or a Transform stream in object mode'))
  }
  return getStream(stream)
}

/**
 * Expand the Babel toolchain to sequentially apply transformations. Return an
 * array of string, split by root ExpressionStatement. See the plugins
 * documentation below.
 * @param {String} code - the code to expand
 * @return {String} - the expanded code
 */
export function expand(code) {
  const pluginsSequence = [
    fromDirectiveToStringLiteral,
    fromBinaryExpressionPipeToStreamPipe,
    fromIdentifierToCallExpression,
    fromMemberExpressionToCallExpression,
    fromLiteralToWrapper,
    appendStringify
  ]
  const finalAst = pluginsSequence.reduce((ast, plugin) =>
    transformFromAst(ast, null, babelOptions({
      code: false,
      plugins: [plugin]
    })).ast
  , transform(code, babelOptions()).ast)
  return finalAst.program.body
    .map(expressionStatement => {
      if (!t.isExpressionStatement(expressionStatement)) {
        throw new ExpressionError('Only ExpressionStatement are allowed as the root nodes')
      }
      const nodes = t.isSequenceExpression(expressionStatement.expression) ?
        expressionStatement.expression.expressions : [expressionStatement.expression]
      return nodes.map(node => transformFromNode(node, null, babelOptions()).code)
    })
}

/**
 * Reinject the Directive's as StringLiteral's.
 * @return {Object} - the babel plugin options
 */
export function fromDirectiveToStringLiteral() {
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
          ...directives
        ], 'start')
      }
    }
  }
}

/**
 * Tranform Identifier to CallExpression.
 * Syntactic sugar for: `a` instead of `a()`
 * @return {Object} - the babel plugin options
 */
export function fromIdentifierToCallExpression() {
  const toCallExpression = node => {
    return t.isIdentifier(node) ? t.callExpression(node, []) : node
  }
  return {
    visitor: {
      Program(path) {
        path.node.body = path.node.body.map(child =>
          t.isExpressionStatement(child) ? t.expressionStatement(toCallExpression(child.expression)) : child
        )
      },
      CallExpression(path) {
        if (isPipeCallExpression(path.node)) {
          path.node.arguments = path.node.arguments.map(toCallExpression)
        }
      },
      MemberExpression(path) {
        if (isPipeCallExpression({callee: path.node})) {
          path.node.object = toCallExpression(path.node.object)
        }
      },
      SequenceExpression(path) {
        path.node.expressions = path.node.expressions.map(toCallExpression)
      }
    }
  }
}

/**
 * Transform MemberExpression to CallExpression.
 * Syntactic sugar for: `a.b` instead of `a.b()`
 * @return {Object} - the babel plugin options
 */
export function fromMemberExpressionToCallExpression() {
  const toCallExpression = node => {
    return t.isMemberExpression(node, {computed: false}) ? t.callExpression(node, []) : node
  }
  return {
    visitor: {
      CallExpression(path) {
        if (t.isMemberExpression(path.node.callee, {computed: false}) &&
            t.isIdentifier(path.node.callee.property, {name: 'pipe'})) {
          path.node.callee.object = toCallExpression(path.node.callee.object)
          path.node.arguments = path.node.arguments.map(toCallExpression)
        }
      },
      MemberExpression(path) {
        if (t.isExpressionStatement(path.parentPath.node)) {
          path.replaceWith(toCallExpression(path.node))
        }
      }
    }
  }
}

/**
 * Tranform the `|` binary operator into a `.pipe()` call (left precedence).
 * Syntactic sugar for `a() | b()` instead of `a().pipe(b())`
 * @return {Object} - the babel plugin options
 */
export function fromBinaryExpressionPipeToStreamPipe() {
  return {
    visitor: {
      BinaryExpression: {
        exit(path) {
          if (!t.isBinaryExpression(path.node, {operator: '|'})) {
            return
          }
          path.replaceWith(
            t.callExpression(
              t.memberExpression(path.node.left, t.identifier(STREAM_PIPE), false),
              [path.node.right]
            )
          )
        }
      }
    }
  }
}

/**
 * Wrap the literals into a stream. Support template literals.
 * Syntactic sugar for `'foobar'` instead of `raw('foobar')`, or `\`${name}\``
 * instead of `template('${name}')`
 * @return {Object} - the babel plugin options
 */
export function fromLiteralToWrapper() {
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
        const callee = t.identifier(PLUGIN_RAW)
        const args = [
          node
        ]
        return t.callExpression(callee, args)
      }
      case 'TemplateLiteral': {
        const callee = t.identifier(isEmpty(node.expressions) ? PLUGIN_RAW : PLUGIN_TEMPLATE)
        const args = [
          t.stringLiteral(
            transformFromNode(node, null, babelOptions())
              .code
              .slice(
                +Number('`'.length),
                -Number('`\n'.length)
              )
          )
        ]
        return t.callExpression(callee, args)
      }
      default:
        return node
    }
  }
  return {
    visitor: {
      Program(path) {
        path.node.body = path.node.body.map(child =>
          t.isExpressionStatement(child) ? t.expressionStatement(wrap(child.expression)) : child
        )
      },
      CallExpression(path) {
        if (isPipeCallExpression(path.node)) {
          path.node.arguments = path.node.arguments.map(wrap)
        }
      },
      SequenceExpression(path) {
        path.node.expressions = path.node.expressions.map(wrap)
      }
    }
  }
}

/**
 */
export function appendStringify() {
  const toCallExpression = node => {
    return t.callExpression(
      t.memberExpression(node, t.identifier(STREAM_PIPE), false),
      [t.callExpression(t.identifier(PLUGIN_STRINGIFY), [])]
    )
  }
  return {
    visitor: {
      ExpressionStatement(path) {
        if (t.isCallExpression(path.node.expression)) {
          path.node.expression = toCallExpression(path.node.expression)
        }
      },
      SequenceExpression(path) {
        path.node.expressions = path.node.expressions.map(toCallExpression)
      }
    }
  }
}

/**
 * Check whether a CallExpression is a .pipe()
 * @param {CallExpression} node - the node to check
 * @return {Boolean} - true if a .pipe(), false otherwise
 */
function isPipeCallExpression(node) {
  return t.isMemberExpression(node.callee, {computed: false}) &&
         t.isIdentifier(node.callee.property, {name: STREAM_PIPE})
}

/**
 * The shared babel options, can be overriden.
 * @param {...Object=} overrides - the overrides
 * @return {Object} - The babel options
 */
function babelOptions(override = {}) {
  return {
    babelrc: false,
    comments: false,
    compact: true,
    minified: true,
    ...override
  }
}

/**
 * Extend babel.transformFromAst to allow to transform from a single node.
 * @param {Node} node - An AST node
 * @param {String} code - the code to use for the source maps
 * @param {Options=} options - the transformation options
 * @return {Object} - a { code, map, ast } result
 */
function transformFromNode(node, code = null, options = {}) {
  const ast =
    t.file(
      t.program([
        t.isExpressionStatement(node) ? node : t.expressionStatement(node)
      ]),
      null,
      null
    )
  return transformFromAst(ast, code, options)
}

/**
 * Return a new ExpressionError.
 * @param {String} message - the message to wrap in the error
 * @return {ExpressionError} - the error
 */
function ExpressionError(message) {
  const error = new Error(message)
  error.name = 'ExpressionError'
  return error
}
