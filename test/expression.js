import {expand} from '../src/expression'

describe('expand()', () => {
  it('should throw if a different type than ExpressionStatement is found in the Program body', () => {
    expect(expand.bind(null, `
      const foo = 'bar'
    `)).toThrowError('Only ExpressionStatement are allowed as the root nodes')
  })

  it('should remove comments', () => {
    expect(expand(`
      // test
    `)).toEqual([])
  })

  it('should support several ExpressionStatement', () => {
    expect(expand(`
      a;
      b;
    `)).toEqual([
      ['a().pipe(stringify());'],
      ['b().pipe(stringify());']
    ])
  })

  it('should support several SequenceExpression', () => {
    expect(expand(`
      a | b, c | d
      e.pipe(f), g | h()
      i, j
    `)).toEqual([
      ['a().pipe(b()).pipe(stringify());', 'c().pipe(d()).pipe(stringify());'],
      ['e().pipe(f()).pipe(stringify());', 'g().pipe(h()).pipe(stringify());'],
      ['i().pipe(stringify());', 'j().pipe(stringify());']
    ])
  })

  it('should interpret directives as string literals', () => {
    expect(expand(`
      'use strict'
    `)).toEqual([
      ['raw("use strict").pipe(stringify());']
    ])
  })

  it('should expand from Identifier to CallExpression', () => {
    expect(expand(`
      a | b
      a
    `)).toEqual([
      ['a().pipe(b()).pipe(stringify());'],
      ['a().pipe(stringify());']
    ])
  })

  it('should expand from MemberExpression to CallExpression', () => {
    expect(expand(`
      a.b
    `)).toEqual([
      ['a.b().pipe(stringify());']
    ])
  })

  it('should expand from BinaryExpression to .pipe() (with left associativity)', () => {
    expect(expand(`
      a() | b()
      a() | b() | c()
    `)).toEqual([
      ['a().pipe(b()).pipe(stringify());'],
      ['a().pipe(b()).pipe(c()).pipe(stringify());']
    ])
  })

  it('should expand from a mix of BinaryExpression and .pipe() (with left associativity)', () => {
    expect(expand(`
      a().pipe(b()) | c;
      (a | b).pipe(c);
    `)).toEqual([
      ['a().pipe(b()).pipe(c()).pipe(stringify());'],
      ['a().pipe(b()).pipe(c()).pipe(stringify());']
    ])
  })

  it('should expand ArrayExpression to the raw plugin', () => {
    expect(expand(`
      []
    `)).toEqual([
      ['raw([]).pipe(stringify());']
    ])
  })

  it('should expand BooleanLiteral to the raw plugin', () => {
    expect(expand(`
      true
      false
    `)).toEqual([
      ['raw(true).pipe(stringify());'],
      ['raw(false).pipe(stringify());']
    ])
  })

  it('should expand NullLiteral to the raw plugin', () => {
    expect(expand(`
      null
    `)).toEqual([
      ['raw(null).pipe(stringify());']
    ])
  })

  it('should expand NumericLiteral to the raw plugin', () => {
    expect(expand(`
      0
    `)).toEqual([
      ['raw(0).pipe(stringify());']
    ])
  })

  it('should expand ObjectExpression to the raw plugin', () => {
    expect(expand(`
      ({})
    `)).toEqual([
      ['raw({}).pipe(stringify());']
    ])
  })

  it('should expand RegExpLiteral to the raw plugin', () => {
    expect(expand(`
      /foobar/
    `)).toEqual([
      ['raw(/foobar/).pipe(stringify());']
    ])
  })

  it('should expand StringLiteral to the raw plugin', () => {
    expect(expand(`
      'foo'
      "bar"
    `)).toEqual([
      ['raw("foo").pipe(stringify());'],
      ['raw("bar").pipe(stringify());']
    ])
  })

  it('should expand UnaryExpression to the raw plugin', () => {
    expect(expand(`
      -1;
      +1;
      -' ';
    `)).toEqual([
      ['raw(-1).pipe(stringify());'],
      ['raw(+1).pipe(stringify());'],
      ['raw(-" ").pipe(stringify());']
    ])
  })

  it('should expand TemplateLiteral to the template plugin if at least one expression', () => {
    expect(expand(`
      \`one expression: \${1}\`
    `)).toEqual([
      ['template("one expression: ${1}").pipe(stringify());'] // eslint-disable-line no-template-curly-in-string
    ])
  })

  it('should expand TemplateLiteral to the raw plugin if no expressions', () => {
    expect(expand(`
      \`no expressions\`
    `)).toEqual([
      ['raw("no expressions").pipe(stringify());']
    ])
  })

  it('should support nested MemberExpression', () => {
    expect(expand(`
      a.b.c | d.e.f | g.h.i | \`\${name}\`
    `)).toEqual([
      ['a.b.c().pipe(d.e.f()).pipe(g.h.i()).pipe(template("${name}")).pipe(stringify());'] // eslint-disable-line max-len, no-template-curly-in-string
    ])
  })

  it('should allow complex use cases', () => {
    expect(expand(`
      open('./package.json') | json | \`npm install --global \${name}\`
    `)).toEqual([
      ['open("./package.json").pipe(json()).pipe(template("npm install --global ${name}")).pipe(stringify());'] // eslint-disable-line max-len, no-template-curly-in-string
    ])
  })

  it('should not expand literals in nested expression statements', () => {
    expect(expand(`
      identifier([], true, false, null, -1, 0, +1, {}, /regex/, "", \`\`)
    `)).toEqual([
      ['identifier([],true,false,null,-1,0,+1,{},/regex/,"",``).pipe(stringify());']
    ])
  })

  it('should support the chaining of several raw expressions', () => {
    expect(expand(`
      'a', 'b'
    `)).toEqual([
      ['raw("a").pipe(stringify());', 'raw("b").pipe(stringify());']
    ])
  })
})
