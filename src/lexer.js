import { last } from 'lodash'

export function tokenize(buffer, options = {}) {
  const tokens = []
  const cursor = { index: 0 }
  let token = null
  while (cursor.index < buffer.length) {
    if (token = ExpressionToken.from(buffer, cursor)) {
      tokens.push(token)
    } else if (token = ReturnToken.from(buffer, cursor)) {
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
export class ExpressionToken extends Token {
  static from(buffer, cursor = { index: 0 }) {
    const match = buffer.substring(cursor.index).match(/^<!-{2,}[\s]*([a-zA-Z_][\w]*)[\s]*:[\s]*([a-zA-Z_][\w]*[\s]*\([\s\S]+?)[\s]*-{2,}>/)
    if (!(match && match.length === 3)) {
      return null
    }
    const [ raw, label, expression ] = match
    cursor.index += raw.length
    return new ExpressionToken({
      raw,
      label,
      expression
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
