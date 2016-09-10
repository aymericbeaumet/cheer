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

})
