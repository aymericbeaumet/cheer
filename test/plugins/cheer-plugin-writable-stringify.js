import { Writable } from 'stream'
import plugins from '../../src/plugins'

const { stringify } = plugins()

describe('stringify', () => {
  it('should be returned by plugins()', () => {
    expect(stringify).toBeTruthy()
  })

  it('should return an instanceof Writable stream', () => {
    expect(stringify() instanceof Writable).toBe(true)
  })

  it('should be toString() with the stringified value', () => {
    return new Promise((resolve, reject) => {
      const writable = stringify()
      writable
        .once('error', reject)
        .once('finish', () => resolve([
          expect(writable.toString()).toBe('true'),
        ]))
        .end(true)
    })
  })

  it('should leave strings as is', () => {
    return new Promise((resolve, reject) => {
      const writable = stringify()
      writable
        .once('error', reject)
        .once('finish', () => resolve([
          expect(writable.toString()).toBe('already a string'),
        ]))
        .end('already a string')
    })
  })

  it('should emit errors on JSON.stringify errors', () => {
    return new Promise((resolve, reject) => {
      const cyclic = {}
      cyclic.cyclic = cyclic
      const writable = stringify()
      writable
        .once('error', resolve)
        .end(cyclic)
    })
  })
})
