import { last } from 'lodash'

export function tokenize(buffer, options = {}) {
  const tokens = []
  const pointer = { index: 0 }
  let token = null
  while (pointer.index < buffer.length) {
    if (token = DoToken.from(buffer, pointer)) {
      tokens.push(token)
    } else if (token = DoneToken.from(buffer, pointer)) {
      tokens.push(token)
    } else {
      const lastToken = last(tokens)
      if (lastToken instanceof StringToken) {
        lastToken.append(buffer, pointer)
      } else {
        tokens.push(StringToken.from(buffer, pointer))
      }
    }
  }
  console.log(tokens)
  return tokens
}

export class Token {
  constructor(...args) {
    Object.assign(this, ...args)
  }
}

export class DoToken extends Token {
  static from(buffer, pointer) {
    const match = buffer.substring(pointer.index).match(/^<!-{2,}[\s]*DO[\s]+([a-zA-Z_][\w]*)[\s]*\((.*)\)[\s]*-{2,}>/)
    if (!match) {
      return null
    }
    const [ raw, source, args ] = match
    pointer.index += raw.length
    return new DoToken({
      raw,
      source,
      args: JSON.parse(`[ ${args} ]`),
    })
  }
}

export class DoneToken extends Token {
  static from(buffer, pointer) {
    const match = buffer.substring(pointer.index).match(/^<!-{2,}[\s]*DONE[\s]*-{2,}>/)
    if (!match) {
      return null
    }
    const [ raw ] = match
    pointer.index += raw.length
    return new DoneToken({
      raw,
    })
  }
}

export class StringToken extends Token {
  static from(buffer, pointer) {
    return new StringToken({
      raw: buffer[pointer.index++],
    })
  }

  append(buffer, pointer) {
    this.raw += buffer[pointer.index++]
  }
}
