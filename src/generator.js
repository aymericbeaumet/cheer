import { map } from 'bluebird'
import { File, BlockStatement, ExpressionStatement, ReturnStatement, StringLiteral } from './parser'

export function generate(node, options) {
  return walk(node, options)
}

/**
 */
async function walk(node, options) {
  if (node instanceof File) {
    return (await map(node.body, child => walk(child, options))).join('')
  }
  if (node instanceof BlockStatement) {
    const expressionStatements = node.body.filter(child => child instanceof ExpressionStatement)
    const returnStatements = node.body.filter(child => child instanceof ReturnStatement)
    return [
      ...(expressionStatements.map(child => `${child.raw}${options.linebreak}`)),
      ...(await map(expressionStatements, child => walk(child, options))).map(result => `${result}${options.linebreak}`),
      ...(returnStatements.map(child => child.raw)),
    ].join('')
  }
  if (node instanceof ExpressionStatement) {
    return 'ExpressionStatement'
  }
  if (node instanceof StringLiteral) {
    return node.raw
  }
  throw new Error(node, `[Generator] Unexpected node type: ${node}`)
}
