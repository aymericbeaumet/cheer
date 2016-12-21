import {Transform} from 'stream'
import plugins from '../../src/plugins'

const {yaml} = plugins()

describe('yaml', () => {
  it('should be returned by plugins()', () => {
    expect(yaml).toBeTruthy()
  })

  it('should return an instanceof Transform stream', () => {
    expect(yaml() instanceof Transform).toBe(true)
  })

  it('should take input as yaml string and emit an object', () => {
    return new Promise((resolve, reject) => {
      const transform = yaml()
      transform
        .once('error', reject)
        .once('readable', () => transform.read())
        .on('data', data => resolve([
          expect(data).toEqual({foo: 'bar'})
        ]))
        .write('foo: bar')
    })
  })

  it('should forward YAML syntax errors', () => {
    return new Promise(resolve => {
      const transform = yaml()
      transform
        .once('error', resolve)
        .once('readable', () => transform.read())
        .write('"')
    })
  })
})
