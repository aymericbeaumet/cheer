import {readFile} from 'fs'
import http from 'http'
import https from 'https'
import {resolve} from 'path'
import {Readable} from 'stream'
import {parse} from 'url'
import {merge} from 'lodash'

class OpenReadable extends Readable {
  constructor(url, options = {}) {
    super({objectMode: true})
    this.pending = false
    this.options = merge({}, parse(url), options)
    if (!this.options.protocol) {
      this.options.protocol = this.options.protocol || 'file:'
      this.options.href = `${this.options.protocol}/${this.options.href}`
    }
  }
  _read() {
    if (this.pending) {
      return
    }
    const {protocol} = this.options
    switch (protocol) {
      case 'file:': {
        const filepath = resolve(process.cwd(), this.options.href.slice(`${protocol}/`.length))
        readFile(filepath, (error, buffer) => {
          if (error) {
            return this.emit('error', error)
          }
          this.push(buffer.toString())
          this.push(null)
        })
        this.pending = true
        return this.pending
      }
      case 'http:':
      case 'https:': {
        const {request} = protocol === 'http:' ? http : https
        request(this.options, response => {
          let data = ''
          response
            .on('data', chunk => {
              data += chunk
            })
            .on('end', () => {
              this.push(data)
              this.push(null)
            })
        })
          .on('error', this.emit.bind(this, 'error'))
          .end()
        this.pending = true
        return this.pending
      }
      default:
        return this.emit('error', new Error(`Unsupported protocol: ${protocol}`))
    }
  }
}

export default function cheerPluginReadableOpen() {
  return {
    open: (...args) => new OpenReadable(...args)
  }
}
