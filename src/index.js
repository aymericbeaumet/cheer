import fs from 'fs'
import { dirname, resolve } from 'path'
import { inspect } from 'util'
import { map, promisify } from 'bluebird'
import { interpretAst } from './interpreter'
import { createTokens } from './lexer'
import { createAst } from './parser'

const readFile = promisify(fs.readFile)

/**
 * Galvanize several files.
 * @param {String[]} files - the files to iterate on
 * @param {Object=} options - the options
 * @return {Bluebird} - resolved with an array of results
 */
export function fromFiles(files, options = {}) {
  return map(files, function mapFile(file) {
    return fromFile(file, options)
  })
}

/**
 * Galvanize a single file.
 */
export async function fromFile(file, {
  cwd = process.cwd(),
  ...options,
} = {}) {
  const filepath = resolve(cwd, file)
  const filecontent = await readFile(filepath)
  return fromBuffer(filecontent, {
    cwd: dirname(filepath),
    ...options,
  })
}

/**
 * Galvanize an input.
 * @param {String|Buffer} input - the input to galvanize
 */
export async function fromBuffer(input, {
  cwd = process.cwd(),
  dryRun = false,
  filepath = null,
  linebreak = input.toString().includes('\r\n') ? '\r\n' : '\n',
  lint = false,
  printAst = false,
  printTokens = false,
} = {}) {
  const bufferAsString = input.toString()
  const tokens = createTokens(bufferAsString)
  if (printTokens) {
    console.log(inspect(tokens, {
      colors: true,
      depth: Infinity,
    }))
    process.exit() // eslint-disable-line xo/no-process-exit
  }
  const ast = createAst(tokens)
  if (printAst) {
    console.log(inspect(ast, {
      colors: true,
      depth: Infinity,
    }))
    process.exit() // eslint-disable-line xo/no-process-exit
  }
  const newBuffer = await interpretAst(ast, {
    cwd,
    linebreak,
  })
  if (lint && bufferAsString !== newBuffer) {
    throw new Error(`[Linter] ${filepath || 'Input'} is outdated`)
  }
  if (dryRun) {
    process.stdout.write(newBuffer)
    process.exit() // eslint-disable-line xo/no-process-exit
  }
  return newBuffer
}
