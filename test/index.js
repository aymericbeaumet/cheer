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
})
