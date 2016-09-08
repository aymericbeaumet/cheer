import { last } from 'lodash'
import { expand } from './expression'

export function tokenize(buffer, options = {}) {
  const cursor = { index: 0 }
  const tokens = []
  let token = null
  while (cursor.index < buffer.length) {
    if ((token = ExpressionToken.from(buffer, cursor)) ||
        (token = ReturnToken.from(buffer, cursor)) ||
        (token = EOLToken.from(buffer, cursor))) {
      tokens.push(token)
    } else {
      const lastToken = last(tokens)
      if (lastToken instanceof StringToken) {
        lastToken.append(buffer, cursor)
      } else {
        tokens.push(StringToken.from(buffer, cursor))
      }
    }
  }
  if (cursor.index !== buffer.length) {
    throw new Error(`[Lexer] Cursor index (${cursor.index}) is not equal to the buffer length (${buffer.length})`)
  }
  tokens.push(new EOFToken())
  return tokens
}

/**
 */
export class Token {
  constructor(...args) {
    Object.assign(this, ...args)
  }

  toString() {
    return this.raw.toString()
  }
}

/**
 */
export class EOLToken extends Token {
  static from(buffer, cursor = { index: 0 }) {
    const match = buffer.substring(cursor.index).match(/^(?:\r\n|\r|\n)/)
    if (!(match && match.length === 1)) {
      return null
    }
    const [ raw ] = match
    cursor.index += raw.length
    return new EOLToken({
      raw,
    })
  }
}

/**
 */
export class EOFToken extends Token {
}

/**
 */
export class ExpressionToken extends Token {
  static from(buffer, cursor = { index: 0 }) {
    const match = buffer.substring(cursor.index).match(/^<!-{2,}[\s]*([a-zA-Z_][\w]*)[\s]*:[\s]*([a-zA-Z_][\w]*[\s]*\([\s\S]+?)[\s]*-{2,}>/)
    if (!(match && match.length === 3)) {
      return null
    }
    const [ raw, label, expression ] = match
    // TODO: find a meaningful reason to allow the users to specify their own
    // label, for now ignore the entire token if different from 'cheer'
    if (label !== 'cheer') {
      return null
    }
    cursor.index += raw.length
    return new ExpressionToken({
      raw,
      label,
      expression: expand(expression),
    })
  }
}

/**
 */
export class ReturnToken extends Token {
  static from(buffer, cursor = { index: 0 }) {
    const match = buffer.substring(cursor.index).match(/^<!-{2,}[\s]*([a-zA-Z_][\w]*)[\s]*:[\s]*return[\s]*-{2,}>/)
    if (!(match && match.length === 2)) {
      return null
    }
    const [ raw, label ] = match
    // TODO: find a meaningful reason to allow the users to specify their own
    // label, for now ignore the entire token if different from 'cheer'
    if (label !== 'cheer') {
      return null
    }
    cursor.index += raw.length
    return new ReturnToken({
      raw,
      label,
    })
  }
}

/**
 */
export class StringToken extends Token {
  static from(buffer, cursor = { index: 0 }) {
    return new StringToken({
      raw: buffer[cursor.index++],
    })
  }

  append(buffer, cursor) {
    this.raw += buffer[cursor.index++]
  }
}
