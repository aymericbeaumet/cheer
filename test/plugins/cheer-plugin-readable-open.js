import { Readable } from 'stream'
import fs from 'mock-fs'
import nock from 'nock'
import plugins from '../../src/plugins'

const { open } = plugins()

afterEach(() => {
  fs.restore()
  nock.cleanAll()
})

describe('open', () => {
  it('should be returned by plugins()', () => {
    expect(open).toBeTruthy()
  })

  it('should return an instanceof Readable stream', () => {
    expect(open('') instanceof Readable).toBe(true)
  })

  it('should throw when called without an url', () => {
    expect(open).toThrowError()
  })

  it('should emit an error when the protocol is not supported', () => {
    return new Promise((resolve, reject) => {
      const readable = open('unsupported://url')
      readable
        .once('error', resolve)
        .once('readable', () => readable.read())
    })
  })

  const fileProtocols = [
    [ 'INFERRED PROTOCOL TO FILE', '' ],
    [ 'FILE PROTOCOL', 'file:/' ],
  ]
  fileProtocols.forEach(([ description, protocol ]) => {
    it(`should support ${description} and emit the file content when found`, () => {
      fs({ '/file/exists': 'filecontent' })
      return new Promise((resolve, reject) => {
        const onData = jest.fn()
        const readable = open(`${protocol}/file/exists`)
        readable
          .once('error', reject)
          .once('readable', () => readable.read())
          .on('data', onData)
          .once('end', () => resolve([
            expect(onData.mock.calls).toEqual([ [ 'filecontent' ] ]),
          ]))
      })
    })

    it(`should support ${description} and support relative links`, () => {
      fs({ 'file/exists': 'filecontent' })
      return new Promise((resolve, reject) => {
        const onData = jest.fn()
        const readable = open(`${protocol}file/exists`)
        readable
          .once('error', reject)
          .once('readable', () => readable.read())
          .on('data', onData)
          .once('end', () => resolve([
            expect(onData.mock.calls).toEqual([ [ 'filecontent' ] ]),
          ]))
      })
    })

    it(`should support ${description} and emit an error when not found`, () => {
      return new Promise((resolve, reject) => {
        const readable = open(`${protocol}/file/doesnt/exist`)
        readable
          .once('error', error => resolve())
          .once('readable', () => readable.read())
      })
    })
  })

  const httpProtocols = [
    [ 'HTTP PROTOCOL', 'http:/' ],
    [ 'HTTPS PROTOCOL', 'https:/' ],
  ]
  httpProtocols.forEach(([ description, protocol ]) => {
    it(`should support ${description}, default to GET and emit the body`, () => {
      nock(`${protocol}/foobar.com`).get('/path').reply(200, 'body')
      return new Promise((resolve, reject) => {
        const onData = jest.fn()
        const readable = open(`${protocol}/foobar.com/path`)
        readable
          .once('error', reject)
          .once('readable', () => readable.read())
          .on('data', onData)
          .once('end', () => resolve([
            expect(onData.mock.calls).toEqual([ [ 'body' ] ]),
          ]))
      })
    })

    it(`should support ${description}, allow overriding the HTTP method and emit the body`, () => {
      nock(`${protocol}/foobar.com`).post('/path').reply(200, 'body')
      return new Promise((resolve, reject) => {
        const onData = jest.fn()
        const readable = open(`${protocol}/foobar.com/path`, { method: 'POST' })
        readable
          .once('error', reject)
          .once('readable', () => readable.read())
          .on('data', onData)
          .once('end', () => resolve([
            expect(onData.mock.calls).toEqual([ [ 'body' ] ]),
          ]))
      })
    })

    it(`should support ${description} and emit the request errors`, () => {
      nock(`${protocol}/foobar.com`).get('/path').replyWithError('')
      return new Promise((resolve, reject) => {
        const onData = jest.fn()
        const readable = open(`${protocol}/foobar.com/path`)
        readable
          .once('error', resolve)
          .once('readable', () => readable.read())
          .on('data', onData)
      })
    })
  })
})
