import fs from 'fs'
import { dirname, resolve } from 'path'
import { inspect } from 'util'
import { map, promisify } from 'bluebird'
import generate from './generator'
import tokenize from './lexer'
import parse from './parser'
import plugins from './plugins'

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

/**
 * Galvanize several files.
 * @public
 * @param {String[]} files - the files to iterate on
 * @param {Object=} options - the options
 * @return {Promise<String[]>} - resolved with an array of results
 */
export function fromFiles(files, options = {}) {
  return map(files, function mapFile(file) {
    return fromFile(file, options)
  })
}

/**
 * Galvanize a single file.
 * @public
 * @return {Promise<String>} - description
 */
export async function fromFile(file, {
  cwd = process.cwd(),
  ...options,
} = {}) {
  const filepath = resolve(cwd, file)
  const input = await readFileAsync(filepath)
  const output = await fromBuffer(input, {
    ...options,
    cwd: dirname(filepath),
    filepath,
  })
  return await writeFileAsync(filepath, output)
}

/**
 * Galvanize an input.
 * @public
 * @param {String|Buffer} buffer - the input to galvanize
 * @return {Promise<String>} - the galvanized input
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
    printObjectToStdoutAndExit(tokens)
  }
  const ast = parse(tokens)
  if (printAst) {
    printObjectToStdoutAndExit(ast)
  }
  const output = await generate(ast, {
    linebreak,
    plugins: plugins({ cwd, filepath, linebreak }),
  })
  if (lint && input !== output) {
    throw new LinterError(`${filepath || 'Input'} is outdated`)
  }
  if (dryRun) {
    printStringToStdoutAndExit(output)
  }
  return output
}

function printObjectToStdoutAndExit(object) {
  console.log(inspect(object, { // eslint-disable-line no-console
    breakLength: 0,
    colors: true,
    depth: Infinity,
    maxArrayLength: Infinity,
  }))
  process.exit() // eslint-disable-line xo/no-process-exit
}

function printStringToStdoutAndExit(string) {
  process.stdout.write(string)
  process.exit() // eslint-disable-line xo/no-process-exit
}

function LinterError(message) {
  const error = new Error(message)
  error.name = 'LinterError'
  return error
}
