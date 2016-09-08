import { last } from 'lodash'
import { ExpressionToken, ReturnToken, StringToken, EOLToken, EOFToken } from './lexer'

/**
 * Create an AST following this EBNF:
 *
 *   File = { BlockStatement | StringLiteral }, EOFToken ;
 *   BlockStatement = ExpressionStatement, { ExpressionStatement | EOLToken }, { StringLiteral }, ReturnToken ;
 *   StringLiteral = StringToken | EOLToken;
 */
export function createAst(tokens, options) {
  const cursor = { index: 0 }
  return File.from(tokens, cursor)
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
export class File extends Node {
  static from(tokens, cursor = { index: 0 }) {
    const body = []
    let node
    while (tokens[cursor.index]) {
      if (node = BlockStatement.from(tokens, cursor)) {
        body.push(node)
      } else if (node = StringLiteral.from(tokens, cursor)) {
        const lastNode = last(body)
        if (lastNode instanceof StringLiteral) {
          lastNode.append(node)
        } else {
          body.push(node)
        }
      } else {
        break
      }
    }
    if (!(tokens[cursor.index] instanceof EOFToken)) {
      throw new Error(`[Parser] Expected EOF, but token:${cursor.index} is ${tokens[cursor.index]}`)
    }
    return new File({
      body,
    })
  }
}

/**
 */
export class BlockStatement extends Node {
  static from(tokens, cursor = { index: 0 }) {
    const body = []
    let node = null
    if (!(node = ExpressionStatement.from(tokens, cursor))) {
      return null
    }
    body.push(node)
    while ((node = ExpressionStatement.from(tokens, cursor) ||
           (node = tokens[cursor.index] instanceof EOLToken))) {
      if (node instanceof ExpressionStatement) {
        body.push(node)
      } else {
        cursor.index++
      }
    }
    while (StringLiteral.from(tokens, cursor)) {}
    if (!(node = ReturnStatement.from(tokens, cursor))) {
      throw new Error(`[Parser] Expected ReturnToken, but token:${cursor.index} is ${tokens[cursor.index]}`)
    }
    body.push(node)
    return new BlockStatement({
      body,
    })
  }
}

/**
 */
export class ExpressionStatement extends Node {
  static from(tokens, cursor = { index: 0 }) {
    if (!(tokens[cursor.index] instanceof ExpressionToken)) {
      return null
    }
    const { raw, label, expression } = tokens[cursor.index++]
    return new ExpressionStatement({
      raw,
      label,
      expression,
    })
  }
}

/**
 */
export class ReturnStatement extends Node {
  static from(tokens, cursor = { index: 0 }) {
    if (!(tokens[cursor.index] instanceof ReturnToken)) {
      return null
    }
    const { raw, label } = tokens[cursor.index++]
    return new ReturnStatement({
      raw,
      label,
    })
  }
}

/**
 */
export class StringLiteral extends Node {
  static from(tokens, cursor = { index: 0 }) {
    if (tokens[cursor.index] instanceof StringToken ||
        tokens[cursor.index] instanceof EOLToken) {
      return new StringLiteral({
        value: tokens[cursor.index++].toString(),
      })
    }
    return null
  }

  append(node) {
    this.value += node.value
  }
}
