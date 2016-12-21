import {Readable} from 'stream'
import plugins from '../../src/plugins'

const {shell} = plugins()

describe('shell', () => {
  it('should be returned by plugins()', () => {
    expect(shell).toBeTruthy()
  })

  it('should return an instanceof Readable stream', () => {
    expect(shell() instanceof Readable).toBe(true)
  })

  it('should emit the result string', () => {
    return new Promise((resolve, reject) => {
      const onData = jest.fn()
      const readable = shell('echo helloworld')
      readable
        .once('error', reject)
        .once('readable', () => readable.read())
        .on('data', onData)
        .once('end', () => resolve([
          expect(onData.mock.calls).toEqual([['helloworld\n']])
        ]))
    })
  })
})
