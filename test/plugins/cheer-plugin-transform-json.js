import {Transform} from 'stream'
import plugins from '../../src/plugins'

const {json} = plugins()

describe('json', () => {
  it('should be returned by plugins()', () => {
    expect(json).toBeTruthy()
  })

  it('should return an instanceof Transform stream', () => {
    expect(json() instanceof Transform).toBe(true)
  })

  it('should take input as JSON string and emit an object', () => {
    return new Promise((resolve, reject) => {
      const transform = json()
      transform
        .once('error', reject)
        .once('readable', () => transform.read())
        .on('data', data => resolve([
          expect(data).toEqual({'this is': 'json'})
        ]))
        .write('{ "this is": "json" }')
    })
  })

  it('should support lax JSON thanks to JSON5', () => {
    return new Promise((resolve, reject) => {
      const transform = json()
      transform
        .once('error', reject)
        .once('readable', () => transform.read())
        .on('data', data => resolve([
          expect(data).toEqual({noquote: 'single quote'})
        ]))
        .write('{ noquote: \'single quote\' }')
    })
  })

  it('should allow to specify a path', () => {
    return new Promise((resolve, reject) => {
      const transform = json('a[0]')
      transform
        .once('error', reject)
        .once('readable', () => transform.read())
        .on('data', data => resolve([
          expect(data).toEqual('b')
        ]))
        .write('{ a: [ \'b\' ] }')
    })
  })

  it('should throw if a parsing error occurs', () => {
    return new Promise(resolve => {
      const transform = json()
      transform
        .once('error', resolve)
        .once('readable', () => transform.read())
        .write('invalid json')
    })
  })
})
