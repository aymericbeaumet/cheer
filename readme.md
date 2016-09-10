<!-->
  open('./package.json') | `# ${name} `
  badge([
    'travis',
    'npm/v',
    { subject: 'license', status: 'Public Domain', color: 'blue', href: 'https://creativecommons.org/publicdomain/zero/1.0' },
  ], { shields: true })
<!-->
<!---->

<!-->
  open('./package.json') | `> ${description}`
<!-->
<!---->

...

## Install

<!-->
  '```bash'
  open('./package.json') | `npm install --global ${name}`
  '```'
<!-->
<!---->

## Usage

### API

<!-->
  jsdoc()
<!-->
<!---->

### CLI

<!-->
  '```bash'
  open('./package.json') | `npm install ---global ${name}`
  '```'
<!-->
<!---->

<!-->
  '```bash'
  '$ cheer ---help'
  '```'
  shell('cheer ---help')
<!-->
<!---->

## Changelog

- 1.0.0
  - Bump stable

## License

[Creative Commons — CC0 1.0 Universal](http://creativecommons.org/publicdomain/zero/1.0)

To the extent possible under law, [Aymeric Beaumet](https://aymericbeaumet.com)
has waived all copyright and related or neighboring rights to this work.
