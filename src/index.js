import fs from 'fs'
import { dirname, resolve } from 'path'
import { inspect } from 'util'
import { map, promisify } from 'bluebird'
import { generate } from './generator'
import { tokenize } from './lexer'
import { parse } from './parser'

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
 * @param {String|Buffer} buffer - the input to galvanize
 * @return {String} - the galvanized input
 */
export async function fromBuffer(buffer, {
  cwd = process.cwd(),
  dryRun = false,
  filepath = null,
  linebreak = buffer.toString().includes('\r\n') ? '\r\n' : '\n',
  lint = false,
  printAst = false,
  printTokens = false,
} = {}) {
  const input = buffer.toString()
  const tokens = tokenize(input)
  if (printTokens) {
    console.log(inspect(tokens, { // eslint-disable-line no-console
      colors: true,
      depth: Infinity,
      maxArrayLength: Infinity,
    }))
    process.exit() // eslint-disable-line xo/no-process-exit
  }
  const ast = parse(tokens)
  if (printAst) {
    console.log(inspect(ast, { // eslint-disable-line no-console
      colors: true,
      depth: Infinity,
      maxArrayLength: Infinity,
    }))
    process.exit() // eslint-disable-line xo/no-process-exit
  }
  const output = await generate(ast, {
    cwd,
    linebreak,
  })
  if (lint && input !== output) {
    throw new Error(`[Linter] ${filepath || 'Input'} is outdated`)
  }
  if (dryRun) {
    process.stdout.write(output)
    process.exit() // eslint-disable-line xo/no-process-exit
  }
  return output
}
