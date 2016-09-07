import { last } from 'lodash'
import { ExpressionToken, ReturnToken, StringToken, EOLToken, EOFToken } from './lexer'

/**
 * Create an AST following this EBNF:
 *
 *   FileContentNode = { ExpressionsBlockNode | StringNode }, EOFToken ;
 *   ExpressionsBlockNode = ExpressionToken, { ExpressionToken | EOLToken }, { StringNode }, ReturnToken ;
 *   StringNode = StringToken | EOLToken;
 */
export function createAst(tokens, options) {
  const cursor = { index: 0 }
  return FileContentNode.from(tokens, cursor)
}

/**
 */
export class Node {
  constructor(...args) {
    Object.assign(this, ...args)
  }
}

/**
 */
export class FileContentNode extends Node {
  static from(tokens, cursor = { index: 0 }) {
    const nodes = []
    let node
    while (tokens[cursor.index]) {
      if (node = ExpressionsBlockNode.from(tokens, cursor)) {
        nodes.push(node)
      } else if (node = StringNode.from(tokens, cursor)) {
        const lastNode = last(nodes)
        if (lastNode instanceof StringNode) {
          lastNode.append(node)
        } else {
          nodes.push(node)
        }
      } else {
        break
      }
    }
    if (!(tokens[cursor.index] instanceof EOFToken)) {
      throw new Error(`[Parser] Expected EOF, but token:${cursor.index} is ${tokens[cursor.index]}`)
    }
    return new FileContentNode({
      nodes,
    })
  }
}

/**
 */
export class ExpressionsBlockNode extends Node {
  static from(tokens, cursor = { index: 0 }) {
    const expressions = []
    if (tokens[cursor.index] instanceof ExpressionToken) {
      expressions.push(tokens[cursor.index++].toObject())
    } else {
      return null
    }
    while (tokens[cursor.index] instanceof ExpressionToken || tokens[cursor.index] instanceof EOLToken) {
      if (tokens[cursor.index] instanceof ExpressionToken) {
        expressions.push(tokens[cursor.index].toObject())
      }
      cursor.index++
    }
    while (StringNode.from(tokens, cursor)) {}
    if (!(tokens[cursor.index++] instanceof ReturnToken)) {
      throw new Error(`[Parser] Expected ReturnToken, but token:${cursor.index} is ${tokens[cursor.index]}`)
    }
    return new ExpressionsBlockNode({
      expressions,
    })
  }
}

/**
 */
export class StringNode extends Node {
  static from(tokens, cursor = { index: 0 }) {
    if (tokens[cursor.index] instanceof StringToken || tokens[cursor.index] instanceof EOLToken) {
      return new StringNode({
        value: tokens[cursor.index++].toString(),
      })
    }
    return null
  }

  append(node) {
    this.value += node.value
  }
}