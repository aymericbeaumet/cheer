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
  '```'
  '$ cheer --help'
  shell('./lib/cli.js --help')
  '```'
--->
```
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

This convenience method allows to call the `fromFile` method with an array of filepaths. The calls are performed in parallel.

- **files**: <code><em>[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)&gt;</em></code> &#x2014; The paths of the files to iterate on
- **options**: <code><em>[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)</em></code> &#x2014; The options to pass down to `fromFile`

Returns <code><em>[Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)&gt;&gt;</em></code> &#x2014; Resolving when all the `fromFile` calls are done with success.

### `fromFile(file, $1)`

This convenience method allows to call the `fromBuffer` method with a filepath. The current working directory ( `options.cwd` ) is set to the filepath directory.

- **file**: <code><em>[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)</em></code> &#x2014; The path of the file to galvanize
- **$1**: <code><em>[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)</em></code> &#x2014; The options passed down to `fromBuffer`
  - **$1.cwd**: <code><em>[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)</em></code> &#x2014; The current working directory from which the file should be resolved, set to the file directory before calling `fromBuffer`
  - **$1.options**: <code><em>...[any](https://flowtype.org/docs/quick-reference.html#any)</em></code>

Returns <code><em>[Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)&gt;</em></code> &#x2014; Resolving when the `fromBuffer` call is done with success, along with overwriting the filepath with the result.

### `fromBuffer(buffer, $1)`

Take an input buffer and return a new transformed buffer with all the expressions executed and the results injected into the new buffer.

- **buffer**: <code><em>[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)|[buffer.Buffer](https://nodejs.org/api/buffer.html#buffer_class_buffer)</em></code> &#x2014; The input to galvanize
- **$1**: <code><em>[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)</em></code> &#x2014; The options
  - **$1.cwd**: <code><em>[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)</em></code> &#x2014; The current working directory
  - **$1.dryRun**: <code><em>[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)</em></code> &#x2014; Write the output to stdout and exit
  - **$1.filepath**: <code><em>[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)</em></code> &#x2014; Used by some plugins
  - **$1.linebreak**: <code><em>[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)</em></code> &#x2014; Which linebreak character should be used, inferred from the buffer by default
  - **$1.lint**: <code><em>[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)</em></code> &#x2014; Check the file for outdated content, and exit with the appropriate error code. Meant to be used in a CI or in `npm run prepublish`
  - **$1.printAst**: <code><em>[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)</em></code> &#x2014; Print the parser AST to stdout and exit
  - **$1.printTokens**: <code><em>[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)</em></code> &#x2014; Print the lexer tokens to stdout and exit

Returns <code><em>[Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)&gt;</em></code> &#x2014; Resolving a new transformed buffer.
<!--->

## Changelog

- 1.0.0
  - Bump stable

## License

[Creative Commons — CC0 1.0 Universal](http://creativecommons.org/publicdomain/zero/1.0)

To the extent possible under law, [Aymeric Beaumet](https://aymericbeaumet.com)
has waived all copyright and related or neighboring rights to this work.
