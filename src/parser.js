import { ExpressionToken, ReturnToken, StringToken } from './lexer'
import raw from './plugins/sources/cheer-plugin-source-raw.js'

export function createSources(tokens, options) {
  const sources = []
  let index = 0
  while (tokens[index]) {
    if (tokens[index] instanceof ReturnToken) {
      throw new Error(`Do not expect an isolated ReturnToken: "${tokens[index]}"`)
    }
    if (tokens[index] instanceof StringToken) {
      sources.push(sourceFromStringToken(tokens[index++], options))
    } else if (tokens[index] instanceof ExpressionToken) {
      const expressions = [ tokens[index++] ]
      let returnExpected = false
      while (tokens[index]) {
        if (tokens[index] instanceof ReturnToken) {
          break
        } else if (returnExpected) {
          throw new Error(`A ReturnToken was expected instead of: "${tokens[index]}"`)
        }
        while (tokens[index] instanceof ExpressionToken || (tokens[index] instanceof StringToken && trim(tokens[index].raw, ` ${linebreak}`).length === 0)) {
          if (tokens[index] instanceof ExpressionToken) {
            expressions.push(tokens[index])
          }
          index++
        }
        while (tokens[index++] instanceof StringToken) {}
        returnExpected = true
      }
      sources.push(sourceFromExpressionTokens(expressions, options))
    }
  }
  return sources
}

export function sourceFromStringToken(token, options) {
  return function source() {
    return raw(options)(token.raw)
  }
}

export function sourceFromExpressionTokens(tokens, options) {
  return function source() {
  }
}
