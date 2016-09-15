import { map } from 'bluebird'
import { File, Block, ExpressionsStatements, Text } from './parser'
import interpret from './interpreter'

/**
 * Generate an output from an AST.
 * @param {Object} root - the root node
 * @param {Object=} options - options to be passed to the generators
 * @return {Promise<String>} - the output
 */
export default async function generate(node, options = {}) {
  if (node instanceof File) {
    return (await map(node.body, child => generate(child, options))).join('')
  }
  if (node instanceof Block) {
    return [
      node.header.raw,
      await generate(node.header.expressions, options),
      node.footer.raw,
    ].join('')
  }
  if (node instanceof ExpressionsStatements) {
    return [
      options.linebreak,
      ...(await map(node.expressions, expression => interpret(expression, options))),
      options.linebreak,
    ].join('')
  }
  if (node instanceof Text) {
    return node.raw
  }
  throw new Error(`[Generator] Unexpected node type: ${node.constructor.name}`)
}
