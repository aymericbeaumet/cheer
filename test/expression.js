import expand from '../src/expression'

describe('expand()', () => {
  it('should throw if a different type than ExpressionStatement is found in the Program body', () => {
    expect(expand.bind(null, `
      const foo = 'bar'
    `)).toThrowError('Only ExpressionStatement are allowed as the root nodes')
  })

  it('should split in several ExpressionStatement', () => {
    expect(expand(`
      a;b
    `).length).toBe(2) // eslint-disable-line no-magic-numbers
  })

  it('should remove comments', () => {
    expect(expand(`
      // test
    `)).toEqual([])
  })

  it('should interpret directives as string literals', () => {
    expect(expand(`
      'use strict'
    `)).toEqual([
      'raw("use strict");',
    ])
  })

  it('should expand from Identifier to CallExpression', () => {
    expect(expand(`
      a | b
      a
    `)).toEqual([
      'a().pipe(b());',
      'a();',
    ])
  })

  it('should expand from MemberExpression to CallExpression', () => {
    expect(expand(`
      a.b
    `)).toEqual([
      'a.b();',
    ])
  })

  it('should expand from BinaryExpression to .pipe() (with left associativity)', () => {
    expect(expand(`
      a() | b()
      a() | b() | c()
    `)).toEqual([
      'a().pipe(b());',
      'a().pipe(b()).pipe(c());',
    ])
  })

  it('should expand from a mix of BinaryExpression and .pipe() (with left associativity)', () => {
    expect(expand(`
      a().pipe(b()) | c;
      (a | b).pipe(c);
    `)).toEqual([
      'a().pipe(b()).pipe(c());',
      'a().pipe(b()).pipe(c());',
    ])
  })

  it('should expand ArrayExpression to the raw plugin', () => {
    expect(expand(`
      []
    `)).toEqual([
      'raw([]);',
    ])
  })

  it('should expand BooleanLiteral to the raw plugin', () => {
    expect(expand(`
      true
      false
    `)).toEqual([
      'raw(true);',
      'raw(false);',
    ])
  })

  it('should expand NullLiteral to the raw plugin', () => {
    expect(expand(`
      null
    `)).toEqual([
      'raw(null);',
    ])
  })

  it('should expand NumericLiteral to the raw plugin', () => {
    expect(expand(`
      0
    `)).toEqual([
      'raw(0);',
    ])
  })

  it('should expand ObjectExpression to the raw plugin', () => {
    expect(expand(`
      ({})
    `)).toEqual([
      'raw({});',
    ])
  })

  it('should expand RegExpLiteral to the raw plugin', () => {
    expect(expand(`
      /foobar/
    `)).toEqual([
      'raw(/foobar/);',
    ])
  })

  it('should expand StringLiteral to the raw plugin', () => {
    expect(expand(`
      'foo'
      "bar"
    `)).toEqual([
      'raw("foo");',
      'raw("bar");',
    ])
  })

  it('should expand UnaryExpression to the raw plugin', () => {
    expect(expand(`
      -1;
      +1;
      -' ';
    `)).toEqual([
      'raw(-1);',
      'raw(+1);',
      'raw(-" ");',
    ])
  })

  it('should expand TemplateLiteral to the template plugin if at least one expression', () => {
    expect(expand(`
      \`one expression: \${1}\`
    `)).toEqual([
      'template("one expression: ${1}");', // eslint-disable-line no-template-curly-in-string
    ])
  })

  it('should expand TemplateLiteral to the raw plugin if no expressions', () => {
    expect(expand(`
      \`no expressions\`
    `)).toEqual([
      'raw("no expressions");',
    ])
  })

  it('should support nested MemberExpression', () => {
    expect(expand(`
      a.b.c | d.e.f | g.h.i | \`\${name}\`
    `)).toEqual([
      'a.b.c().pipe(d.e.f()).pipe(g.h.i()).pipe(template("${name}"));', // eslint-disable-line max-len, no-template-curly-in-string
    ])
  })

  it('should allow complex use cases', () => {
    expect(expand(`
      open('./package.json') | json | \`npm install --global \${name}\`
    `)).toEqual([
      'open("./package.json").pipe(json()).pipe(template("npm install --global ${name}"));', // eslint-disable-line max-len, no-template-curly-in-string
    ])
  })

  it('should not expand literals in nested expression statements', () => {
    expect(expand(`
      identifier([], true, false, null, -1, 0, +1, {}, /regex/, "", \`\`)
    `)).toEqual([
      'identifier([],true,false,null,-1,0,+1,{},/regex/,"",``);',
    ])
  })
})
