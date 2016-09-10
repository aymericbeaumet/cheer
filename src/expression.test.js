import { expand } from './expression'

describe('expression#expand', () => {

    it('should throw if a different type than ExpressionStatement is find in the Program body', () => {
    })

    it('should split in several ExpressionStatement', () => {
      expect(expand('a;b').length).toBe(2)
    })

    it('should remove comments', () => {
      expect(expand(`
        // test
      `)).toEqual([
      ])
    })

    it('should expand from Identifier to CallExpression', () => {
      expect(expand(`
        a
        a(b)
        a.pipe(b)
        a | b
      `)).toEqual([
        'a();',
        'a(b());',
        'a().pipe(b());',
        'a().pipe(b());',
      ])
    })

    it('should expand from BinaryExpression to .pipe()', () => {
      expect(expand(`
        a | b
        a() | b
        a | b()
        a() | b()
      `)).toEqual([
        'a().pipe(b());',
        'a().pipe(b());',
        'a().pipe(b());',
        'a().pipe(b());',
      ])
    })

})
