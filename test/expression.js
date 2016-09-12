import { expand } from '../src/expression'

describe('expand()', () => {

  it('should throw if a different type than ExpressionStatement is found in the Program body', () => {
    expect(expand.bind(null, `
      const foo = 'bar'
    `)).toThrowError('Only ExpressionStatement are allowed as the root nodes')
  })

  it('should split in several ExpressionStatement', () => {
    expect(expand(`
      a;b
    `).length).toBe(2)
  })

  it('should remove comments', () => {
    expect(expand(`
      // test
    `)).toEqual([])
  })

  it('should expand from Identifier to CallExpression', () => {
    expect(expand(`
      a | b
      a
      a(b)
      a.pipe
    `)).toEqual([
      'a().pipe(b());',
      'a();',
      'a(b());',
      'a().pipe;',
    ])
  })

  it('should expand from BinaryExpression to .pipe() with left associativity', () => {
    expect(expand(`
      a() | b()
      a() | b() | c()
    `)).toEqual([
      'a().pipe(b());',
      'a().pipe(b()).pipe(c());',
    ])
  })

  it('should expand ArrayExpression to the wrap plugin', () => {
    expect(expand(`
      []
    `)).toEqual([
      'wrap([]);',
    ])
  })

  it('should expand BooleanLiteral to the wrap plugin', () => {
    expect(expand(`
      true
      false
    `)).toEqual([
      'wrap(true);',
      'wrap(false);',
    ])
  })

  it('should expand NullLiteral to the wrap plugin', () => {
    expect(expand(`
      null
    `)).toEqual([
      'wrap(null);',
    ])
  })

  it('should expand NumericLiteral to the wrap plugin', () => {
    expect(expand(`
      0
    `)).toEqual([
      'wrap(0);',
    ])
  })

  it('should expand ObjectExpression to the wrap plugin', () => {
    expect(expand(`
      ({})
    `)).toEqual([
      'wrap({});',
    ])
  })

  it('should expand RegExpLiteral to the wrap plugin', () => {
    expect(expand(`
      /foobar/
    `)).toEqual([
      'wrap(/foobar/);',
    ])
  })

  it('should expand StringLiteral to the wrap plugin', () => {
    expect(expand(`
      'foo'
      "bar"
    `)).toEqual([
      'wrap("foo");',
      'wrap("bar");',
    ])
  })

  it('should expand UnaryExpression to the wrap plugin', () => {
    expect(expand(`
      -1;
      +1;
    `)).toEqual([
      'wrap(-1);',
      'wrap(+1);',
    ])
  })

  it('should expand TemplateLiteral to the template plugin if at least one expression', () => {
    expect(expand(`
\`
one expression: \${1}
\`
    `)).toEqual([
      'template("\\none expression: ${1}\\n");',
    ])
  })

  it('should expand TemplateLiteral to the wrap plugin if no expressions', () => {
    expect(expand(`
\`
no expressions
\`
    `)).toEqual([
      'wrap("\\nno expressions\\n");',
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
