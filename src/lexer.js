import { last } from 'lodash'
import { expand } from './expression'

/**
 * Create tokens from the input string
 * @param {String} string - the string to parse
 */
export function createTokens(input, options = {}) {
  const cursor = { index: 0 }
  const tokens = []
  let token = null
  while (cursor.index < input.length) {
    if ((token = ReturnToken.from(input, cursor)) ||
        (token = ExpressionToken.from(input, cursor)) ||
        (token = EOLToken.from(input, cursor))) {
      tokens.push(token)
    } else {
      const lastToken = last(tokens)
      if (lastToken instanceof StringToken) {
        lastToken.append(input, cursor)
      } else {
        tokens.push(StringToken.from(input, cursor))
      }
    }
  }
  if (cursor.index !== input.length) {
    throw new Error(`[Lexer] Cursor index (${cursor.index}) is not equal to the input length (${input.length})`)
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
  static from(input, cursor = { index: 0 }) {
    const regexp = /^(?:\r\n|\r|\n)/
    const matches = input.substring(cursor.index).match(regexp)
    const expectedMatches = 1
    if (!(matches && matches.length === expectedMatches)) {
      return null
    }
    const [ raw ] = matches
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
  static from(input, cursor = { index: 0 }) {
    const regexp = /^<!-{2,}[\s]*([a-zA-Z_][\w]*)[\s]*:[\s]*([a-zA-Z_][\w]*[\s]*[\s\S]+?)[\s]*-{2,}>/
    const matches = input.substring(cursor.index).match(regexp)
    const expectedMatches = 3
    if (!(matches && matches.length === expectedMatches)) {
      return null
    }
    const [ raw, label, expression ] = matches
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
  static from(input, cursor = { index: 0 }) {
    const regexp = /^<!-{2,}[\s]*([a-zA-Z_][\w]*)[\s]*:[\s]*return[\s]*-{2,}>/
    const matches = input.substring(cursor.index).match(regexp)
    const expectedMatches = 2
    if (!(matches && matches.length === expectedMatches)) {
      return null
    }
    const [ raw, label ] = matches
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
  static from(input, cursor = { index: 0 }) {
    return new StringToken({
      raw: input[cursor.index++],
    })
  }

  append(input, cursor) {
    this.raw += input[cursor.index++]
  }
}
