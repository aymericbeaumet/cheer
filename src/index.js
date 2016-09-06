import fs from 'fs'
import { dirname, resolve } from 'path'
import { map, promisify } from 'bluebird'
import { tokenize } from './lexer'

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
 * Galvanize a buffer.
 * @param {String|Buffer} buffer - the buffer to galvanize
 */
export async function fromBuffer(buffer, {
  cwd = process.cwd(),
} = {}) {
  const tokens = tokenize(buffer.toString())
}
