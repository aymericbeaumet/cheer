import { map } from 'bluebird'
import { interpret } from './expression'
import { File, Block, ExpressionsStatements, Text } from './parser'

/**
 * Generate an output from an AST.
 * @param {Object} root - the root node
 * @param {Object=} options - options to be passed to the generators
 * @return {Promise<String>} - the output
 */
export default async function generate(node, options = {}) {
  const {
    linebreak = '\n',
    plugins = {},
  } = options
  if (node instanceof File) {
    return (await map(node.body, child => generate(child, options))).join('')
  }
  if (node instanceof Block) {
    return [
      node.header.raw,
      linebreak,
      await generate(node.header.expressions, options),
      node.footer.raw,
    ].join('')
  }
  if (node instanceof ExpressionsStatements) {
    return [
      ...(await map(node.expressions, async function (expressions) {
        return (await map(expressions, expression => interpret(expression, { plugins }))).join('')
      })),
      '',
    ].join(linebreak)
  }
  if (node instanceof Text) {
    return node.raw
  }
  throw new Error(`[Generator] Unexpected node type: ${node.constructor.name}`)
}
