<!---
  open('./package.json') | json | `# ${name}`, ' ',
  badge(['travis', { user: 'aymericbeaumet', repo: 'cheer' }]), ' ',
  badge(['npm/v', { package: 'cheer' }]), ' ',
  badge({ subject: 'license', status: 'Public Domain', color: 'blue', href: 'https://creativecommons.org/publicdomain/zero/1.0' })
--->
# cheer [![travis](https://img.shields.io/travis/aymericbeaumet/cheer.svg)](https://travis-ci.org/aymericbeaumet/cheer) [![npm/v](https://img.shields.io/npm/v/cheer.svg)](https://www.npmjs.com/package/cheer) [![license | Public Domain](https://img.shields.io/badge/license-Public_Domain-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0)
<!--->

<!--- open('./package.json') | json | `> ${description}` --->
> Galvanize your files with dynamic content
<!--->

Cheer is the missing modern way to do inline templating in your Markdown files
through an elegant enhanced JavaScript syntax. No more outdated `.md`, we have
you covered!

- **Simple**: it's just JavaScript, with some enhancements for your own convenience
- **Async-friendly**: support asynchronous calls out of the box
- **Extensible**: thanks to its plugin system
- **Neat**: no external templates files
- **Fast**: all commands are executed in parallel

It does support the following features out-of-the-box:

- Badge generation ([Shields.io](http://shields.io))
- JSDoc documentation ([documentation.js](http://documentation.js.org/))
- Multi-platform shell execution ([execa]https://github.com/sindresorhus/execa))

Loot at this simple example, it:

1. Extracts the commands to execute between <code>&#x3C;!---</code> and <code>---&#x3E;</code>
2. Downloads the latest `cheer` package information through the [npm registry]http://registry.npmjs.org/)
3. Parses that raw text as JSON
4. Injects the parsed JSON into the template string
5. Places the final output between <code>---&#x3E;</code> and <code>&#x3C;!---&#x3E;</code>

```
<!--- open('http://registry.npmjs.org/cheer/latest') | json | `Latest push: ${name}@${version}` --->
Latest push: cheer@0.0.1
<!--->
```

_Note: the parts in <code>&#x3C;!---</code> and <code>---&#x3E;</code> stays
pristine, that's the whole point of inline templating, allowing future calls to
replace the outdated output. This even allows you to add `cheer --lint` to your
CI, making sure your tests breaks if your documentation is outdated!_

Got your attention? Let's [get started](./getting-started.md)!

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
