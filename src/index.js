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
 * This convenience method allows to call the `fromFile` method with an array of
 * filepaths. The calls are performed in parallel.
 * @public
 * @param {String[]} files - The paths of the files to iterate on
 * @param {Object=} options - The options to pass down to `fromFile`
 * @returns {Promise<String[]>} - Resolving when all the `fromFile` calls are
 * done with success.
 */
export function fromFiles(files, options = {}) {
  return map(files, function mapFile(file) {
    return fromFile(file, options)
  })
}

/**
 * This convenience method allows to call the `fromBuffer` method with a
 * filepath. The current working directory (`options.cwd`) is set to the
 * filepath directory.
 * @public
 * @param {String} file - The path of the file to galvanize
 * @param {Object=} $1 - The options passed down to `fromBuffer`
 * @param {String=} $1.cwd - The current working directory from which the
 * file should be resolved, set to the file directory before calling
 * `fromBuffer`
 * @return {Promise<String>} - Resolving when the `fromBuffer` call is done with
 * success, along with overwriting the filepath with the result.
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
 * Take an input buffer and return a new transformed buffer with all the
 * expressions executed and the results injected into the new buffer.
 * @public
 * @param {String|Buffer} buffer - The input to galvanize
 * @param {Object=} $1 - The options
 * @param {String=} $1.cwd - The current working directory
 * @param {Boolean=} $1.dryRun - Write the output to stdout and exit
 * @param {String=} $1.filepath - Used by some plugins
 * @param {String=} $1.linebreak - Which linebreak character should be used,
 * inferred from the buffer by default
 * @param {Boolean=} $1.lint - Check the file for outdated content, and exit with
 * the appropriate error code. Meant to be used in a CI or in `npm run
 * prepublish`
 * @param {Boolean=} $1.printAst - Print the parser AST to stdout and exit
 * @param {Boolean=} $1.printTokens - Print the lexer tokens to stdout and exit
 * @return {Promise<String>} - Resolving a new transformed buffer.
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
