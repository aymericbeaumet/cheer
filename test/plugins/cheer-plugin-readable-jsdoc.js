import {join} from 'path'
import {Readable} from 'stream'
import plugins from '../../src/plugins'

const {jsdoc} = plugins({cwd: join(__dirname, '../../src')})

describe('jsdoc', () => {
  it('should be returned by plugins()', () => {
    expect(jsdoc).toBeTruthy()
  })

  it('should return an instanceof Readable stream', () => {
    expect(jsdoc([]) instanceof Readable).toBe(true)
  })

  it('should emit the documentation', () => {
    return new Promise((resolve, reject) => {
      const onData = jest.fn()
      const readable = jsdoc('./index.js')
      readable
        .once('error', reject)
        .once('readable', () => readable.read())
        .on('data', onData)
        .once('end', () => resolve([
          expect(onData.mock.calls.length).toBe(1)
        ]))
    })
  })
})
