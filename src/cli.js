#!/usr/bin/env node

import { isEmpty } from 'lodash'
import meow from 'meow'
import { fromFiles } from './'

const cli = meow(`
  Usage
    $ cheer [options] file...

  Options
    --dry-run       Do not modify the files, but print the modifications to stdout and exit
    --lint          Do not modify the files, but lint them and exit with an error code if the files are outdated
    --print-ast     Print the AST nodes to stdout and exit
    --print-tokens  Print the Lexer tokens to stdout and exit

  Example
    $ cheer readme.md
`)

if (isEmpty(cli.input)) {
  cli.usage()
  process.exit(1) // eslint-disable-line no-magic-numbers
}

export default fromFiles(cli.input, cli.flags)
