import { Readable } from 'stream'
import plugins from '../../src/plugins'

const { process: { env } } = plugins()

describe('env', () => {
  it('should be returned by plugins()', () => {
    expect(env).toBeTruthy()
  })

  it('should return an instanceof Readable stream', () => {
    expect(env() instanceof Readable).toBe(true)
  })

  it('should emit the process.env object', () => {
    return new Promise((resolve, reject) => {
      const onData = jest.fn()
      const readable = env()
      readable
        .once('error', reject)
        .once('readable', () => readable.read())
        .on('data', onData)
        .once('end', () => resolve([
          expect(onData.mock.calls.length).toBe(1),
          expect(onData.mock.calls[0].length).toBe(1),
          expect(onData.mock.calls[0][0]).toBe(process.env),
        ]))
    })
  })
})
