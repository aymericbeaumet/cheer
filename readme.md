<!---
  open('./package.json') | json | `# ${name} `,
  badge([
    'travis',
    'npm/v',
    { subject: 'license', status: 'Public Domain', color: 'blue', href: 'https://creativecommons.org/publicdomain/zero/1.0' },
  ], { shields: true })
--->
# cheer badge
<!--->

<!--- open('./package.json') | json | `> ${description}` --->
> Galvanize your files with dynamic content
<!--->

...

## Install

<!---
  '```bash'
  open('./package.json') | json | `npm install --global ${name}`
  '```'
--->
```bash
npm install --global cheer
```
<!--->

## Usage

### API

<!--- jsdoc --->
jsdoc
<!--->

### CLI

<!---
  '```bash'
  open('./package.json') | json | `npm install ---global ${name}`
  '```'
--->
```bash
npm install ---global cheer
```
<!--->

<!---
  '```bash'
  '$ cheer --help'
  shell('./lib/cli.js --help')
  '```'
--->
```bash
$ cheer --help

  Galvanize your files with dynamic content

  Usage
    $ cheer [options] file...

  Options
    --dry-run       Do not modify the files, but print the modifications to stdout and exit
    --lint          Do not modify the files, but lint them and exit with an error code if the files are outdated
    --print-ast     Print the AST nodes to stdout and exit
    --print-tokens  Print the Lexer tokens to stdout and exit

  Example
    $ cheer readme.md

```
<!--->

## Changelog

- 1.0.0
  - Bump stable

## License

[Creative Commons — CC0 1.0 Universal](http://creativecommons.org/publicdomain/zero/1.0)

To the extent possible under law, [Aymeric Beaumet](https://aymericbeaumet.com)
has waived all copyright and related or neighboring rights to this work.
