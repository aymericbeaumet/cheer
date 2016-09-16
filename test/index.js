import { fromBuffer } from '../src'

describe('fromBuffer()', () => {
  it('should support empty input', async function() {
    expect(await fromBuffer(``)).toEqual(``)
  })

  it('should not truncate newlines', async function() {
    expect(await fromBuffer(`
`)).toEqual(`\n`)
  })

  it('should interpret expressions', async function() {
    expect(await fromBuffer(`<!--- 'test' ---><!--->`)).toEqual(`<!--- 'test' --->
test
<!--->`)
  })

  it('should leave the expressions in the comments intact', async function() {
    expect(await fromBuffer(`<!---  []  ---><!--->`)).toEqual(`<!---  []  --->
[]
<!--->`)
  })

  it('should insert one line between ExpressionStatement', async function() {
    expect(await fromBuffer(`<!--- 'a'; 'b'; ---><!--->`)).toEqual(`<!--- 'a'; 'b'; --->
a
b
<!--->`)
  })

  it('should not insert anything between SequenceExpression', async function() {
    expect(await fromBuffer(`<!--- 'a', 'b' ---><!--->`)).toEqual(`<!--- 'a', 'b' --->
ab
<!--->`)
  })
})
