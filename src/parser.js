import {isEmpty} from 'lodash'
import {expand} from './expression'
import * as t from './lexer'

class Node {
  constructor({raw, ...props}) {
    Object.defineProperty(this, 'raw', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: raw
    })
    Object.assign(this, {...props})
  }
}

export class Text extends Node {
  static from(tokens, cursor = {index: 0}) {
    let raw = ''
    while ((tokens[cursor.index] instanceof t.TextToken) ||
           (tokens[cursor.index] instanceof t.EndOfLineToken)) {
      raw += tokens[cursor.index++]
    }
    if (isEmpty(raw)) {
      return null
    }
    const node = new Text({raw})
    Object.defineProperty(node, 'raw', {enumerable: true})
    return node
  }
}

export class ExpressionsStatements extends Node {
  static from(tokens, cursor = {index: 0}) {
    let node = null
    if (!(node = Text.from(tokens, cursor))) {
      return null
    }
    const raw = node.raw
    const expressions = expand(raw)
    return new ExpressionsStatements({raw, expressions})
  }
}

export class BlockHeader extends Node {
  static from(tokens, cursor = {index: 0}) {
    let raw = ''
    let expressions = null
    if (!(tokens[cursor.index] instanceof t.OpeningToken)) {
      return null
    }
    raw += tokens[cursor.index++].raw
    if (!(expressions = ExpressionsStatements.from(tokens, cursor))) {
      throw new UnexpectedTokenError('ExpressionsStatements', expressions)
    }
    raw += expressions.raw
    if (!(tokens[cursor.index] instanceof t.SeparatorToken)) {
      throw new UnexpectedTokenError('ShortDelimiterToken', tokens[cursor.index])
    }
    raw += tokens[cursor.index++].raw
    return new BlockHeader({raw, expressions})
  }
}

export class BlockFooter extends Node {
  static from(tokens, cursor = {index: 0}) {
    let raw = ''
    if (!(tokens[cursor.index] instanceof t.ClosingToken)) {
      return null
    }
    raw += tokens[cursor.index++].raw
    return new BlockFooter({raw})
  }
}

export class Block extends Node {
  static from(tokens, cursor = {index: 0}) {
    let raw = ''
    let header = null
    let content = null
    let footer = null
    if (!(header = BlockHeader.from(tokens, cursor))) {
      return null
    }
    raw += header.raw
    content = Text.from(tokens, cursor) || {raw: ''}
    raw += content.raw
    if (!(footer = BlockFooter.from(tokens, cursor))) {
      throw new UnexpectedTokenError('BlockFooter', tokens[cursor.index])
    }
    raw += footer.raw
    return new Block({raw, header, content, footer})
  }
}

export class File extends Node {
  static from(tokens, cursor = {index: 0}) {
    let raw = ''
    const body = []
    let node = null
    while ((node = Block.from(tokens, cursor)) || (node = Text.from(tokens, cursor))) {
      body.push(node)
      raw += node.raw
    }
    if (!((node = tokens[cursor.index]) instanceof t.EndOfFileToken)) {
      throw new UnexpectedTokenError('EndOfFileToken', node)
    }
    return new File({raw, body})
  }
}

function ParserError(message) {
  const error = new Error(message)
  error.name = 'ParserError'
  return error
}

function UnexpectedTokenError(expectedName, foundToken) {
  const {name} = foundToken.constructor
  const {raw, loc: {line, column}} = foundToken
  return new ParserError(`Unexpected token at position ${line}:${column}, should be a ${expectedName}, but found a ${name}:

> ${line} | ${raw}`)
}

/**
 * Create an AST following this EBNF:
 *
 *   File =
 *     { Block | Text },
 *     EndOfFileToken;
 *
 *   Block =
 *     BlockHeader,
 *     [ Text ],
 *     BlockFooter,
 *
 *   BlockHeader =
 *     OpeningToken,
 *     ExpressionsStatements,
 *     SeparatorToken;
 *
 *   BlockFooter =
 *     ClosingToken;
 *
 *   ExpressionsStatements =
 *     Text;
 *
 *   Text =
 *     { TextToken | EndOfLineToken };
 *
 * @param {Token[]} tokens - the tokens to use to create the AST
 * @return {File} - the AST
 */
export default function parse(tokens) {
  const cursor = {index: 0}
  return File.from(tokens, cursor)
}
