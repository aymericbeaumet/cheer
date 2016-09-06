import meow from 'meow'
import { fromFiles } from './'

const cli = meow(`
  Usage
    $ cheer [options] file...

  Options
    --dry-run Do not change any file, write the modifications to stdout
    --lint    Do not change any file, exit with an error code if the files are outdated

  Example
    $ cheer readme.md
`)

export default fromFiles(cli.input, cli.flags)
  .then(function onFinished(results) {
    // console.log(results)
  })
  .catch(function onError(error) {
    console.error(error)
  })
