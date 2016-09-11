import { expand } from '../src/expression'

describe('expression#expand', () => {

  it('should throw if a different type than ExpressionStatement is find in the Program body', () => {
    expect(expand.bind(null, `
      const foo = 'bar'
    `)).toThrowError('Only ExpressionStatement are allowed as the root nodes')
  })

  it('should split in several ExpressionStatement', () => {
    expect(expand('a;b').length).toBe(2)
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
      -1;
      0;
      +1;
    `)).toEqual([
      'wrap(-1);',
      'wrap(0);',
      'wrap(+1);',
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

  it('should expand TemplateLiteral to the template plugin', () => {
    expect(expand(`
\`
multi
line
\${1+1}
\${'foo'}
\${"bar"}
\`
    `)).toEqual([
      'template("\\nmulti\\nline\\n${1+1}\\n${\\"foo\\"}\\n${\\"bar\\"}\\n\");',
    ])
  })

})