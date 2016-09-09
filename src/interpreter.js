import { map } from 'bluebird'
import { File, BlockStatement, ExpressionStatement, ReturnStatement, StringLiteral } from './parser'

export function interpretAst(node, options) {
  return interpret(node, options)
}

/**
 */
async function interpret(node, options) {
  if (node instanceof File) {
    const children = await map(node.body, function mapChild(child) {
      return interpret(child, options)
    })
    return children.join('')
  }
  if (node instanceof BlockStatement) {
    const expressionStatements = node.body.filter(child => child instanceof ExpressionStatement)
    const returnStatements = node.body.filter(child => child instanceof ReturnStatement)
    return [
      ...(expressionStatements.map(child => `${child.raw}${options.linebreak}`)),
      ...(await map(expressionStatements, child => interpret(child, options))),
      ...(returnStatements.map(child => child.raw)),
    ].join('')
  }
  if (node instanceof ExpressionStatement) {
    return 'ExpressionStatement\n'
  }
  if (node instanceof StringLiteral) {
    return node.raw
  }
  throw new Error(node, `[Interpreter] Unknown node type: ${node}`)
}
