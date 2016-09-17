<!---
  open('./package.json') | json | `# ${name} `, badge([
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

## CLI

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

## API

<!--- jsdoc('src/index.js', { hlevel: 3, tags: { title: 'public' } }) --->
### `fromFiles(files, options)`

Galvanize several files.

##### Arguments

- **files** _([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)&gt;)_: The files to iterate on
- **options** _([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))_: The options

##### Returns

- _([Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)&gt;&gt;)_: Resolved with an array of results


### `fromFile(file, $1)`

Galvanize a single file.

##### Arguments

- **file** _([any](https://flowtype.org/docs/quick-reference.html#any))_
- **$1** _([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))_

##### Returns

- _([Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)&gt;)_: Description


### `fromBuffer(buffer, $1)`

Galvanize an input.

##### Arguments

- **buffer** _([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)|[buffer.Buffer](https://nodejs.org/api/buffer.html#buffer_class_buffer))_: The input to galvanize
- **$1** _([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))_

##### Returns

- _([Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)&gt;)_: The galvanized input

<!--->

## Changelog

- 1.0.0
  - Bump stable

## License

[Creative Commons — CC0 1.0 Universal](http://creativecommons.org/publicdomain/zero/1.0)

To the extent possible under law, [Aymeric Beaumet](https://aymericbeaumet.com)
has waived all copyright and related or neighboring rights to this work.
