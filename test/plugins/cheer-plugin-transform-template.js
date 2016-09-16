import { Transform } from 'stream'
import plugins from '../../src/plugins'

const { template } = plugins()

describe('template', () => {
  it('should be returned by plugins()', () => {
    expect(template).toBeTruthy()
  })

  it('should return an instanceof Transform stream', () => {
    expect(template() instanceof Transform).toBe(true)
  })

  it('should take input as object and output an interpolated string', () => {
    return new Promise((resolve, reject) => {
      const transform = template('a = ${a}')
      transform
        .once('error', reject)
        .once('readable', () => transform.read())
        .on('data', data => resolve([
          expect(data).toBe('a = value'),
        ]))
        .write({ a: 'value' })
    })
  })

  it('should support nested template strings', () => {
    return new Promise((resolve, reject) => {
      const transform = template('nested? ${`${"yes"}`}')
      transform
        .once('error', reject)
        .once('readable', () => transform.read())
        .on('data', data => resolve([
          expect(data).toBe('nested? yes'),
        ]))
        .write()
    })
  })
})
