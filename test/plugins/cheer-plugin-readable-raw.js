import {Readable} from 'stream'
import plugins from '../../src/plugins'

const {raw} = plugins()

describe('raw', () => {
  it('should be returned by plugins()', () => {
    expect(raw).toBeTruthy()
  })

  it('should return an instanceof Readable stream', () => {
    expect(raw() instanceof Readable).toBe(true)
  })

  it('should emit the given value', () => {
    return new Promise((resolve, reject) => {
      const onData = jest.fn()
      const readable = raw('value')
      readable
        .once('error', reject)
        .once('readable', () => readable.read())
        .on('data', onData)
        .once('end', () => resolve([
          expect(onData.mock.calls).toEqual([['value']])
        ]))
    })
  })
})
