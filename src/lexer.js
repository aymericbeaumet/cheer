import { last } from 'lodash'

/**
 * Create tokens from the input string
 * @param {String} input - the input to parse
 * @return {Token[]} - a list of tokens
 */
export function tokenize(input) {
  const cursor = { index: 0 }
  const tokens = []
  let token = null
  while (cursor.index < input.length) {
    if ((token = EndOfLineToken.from(input, cursor)) ||
        (token = LongDelimiterToken.from(input, cursor)) ||
        (token = ShortDelimiterToken.from(input, cursor))) {
      tokens.push(token)
    } else {
      const lastToken = last(tokens)
      if (lastToken instanceof TextToken) {
        lastToken.append(input, cursor)
      } else {
        tokens.push(TextToken.from(input, cursor))
      }
    }
  }
  tokens.push(EndOfFileToken.from(input, cursor))
  return tokens
}

/**
 */
export class Token {
  constructor(...args) {
    Object.assign(this, {
      loc: {
        line: Infinity,
        column: Infinity,
      },
      raw: null,
    }, ...args)
  }

  toString() {
    return this.raw.toString()
  }
}

export class EndOfFileToken extends Token {
  static from(input, cursor = { index: 0 }) {
    if (cursor.index !== input.length) {
      throw new LexerError(`Cursor index (${cursor.index}) is not equal to the input length (${input.length})`)
    }
    return new EndOfFileToken()
  }
}

export class EndOfLineToken extends Token {
  static from(input, cursor = { index: 0 }) {
    const regexp = /^(?:\r\n|\r|\n)/
    const matches = input.substring(cursor.index).match(regexp)
    const expectedMatches = 1
    if (!(matches && matches.length === expectedMatches)) {
      return null
    }
    const loc = getLocation(input, cursor.index)
    const [ raw ] = matches
    cursor.index += raw.length
    return new EndOfLineToken({ loc, raw })
  }
}

export class LongDelimiterToken extends Token {
  static from(input, cursor = { index: 0 }) {
    const loc = getLocation(input, cursor.index)
    const raw = '<!---->'
    if (!input.substring(cursor.index).startsWith(raw)) {
      return null
    }
    cursor.index += raw.length
    return new LongDelimiterToken({ loc, raw })
  }
}

export class ShortDelimiterToken extends Token {
  static from(input, cursor = { index: 0 }) {
    const loc = getLocation(input, cursor.index)
    const raw = '<!-->'
    if (!input.substring(cursor.index).startsWith(raw)) {
      return null
    }
    cursor.index += raw.length
    return new ShortDelimiterToken({ loc, raw })
  }
}

export class TextToken extends Token {
  static from(input, cursor = { index: 0 }) {
    const loc = getLocation(input, cursor.index)
    const raw = input[cursor.index++]
    return new TextToken({ loc, raw })
  }

  append(input, cursor) {
    const raw = input[cursor.index++]
    this.raw += raw
  }
}

function getLocation(input, cursorIndex) {
  let line = 1
  let column = 1
  for (let index = 0; index <= cursorIndex; index++) {
    const newline = input.substring(index).match(/^(?:\r\n|\r|\n)/)
    if (newline) {
      line++
      column = 1
      index += newline[0].length
    } else {
      column++
      index++
    }
  }
  return { line, column }
}

function LexerError(message) {
  const error = new Error(message)
  error.name = 'LexerError'
  return error
}
