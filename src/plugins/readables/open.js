import { readFile } from 'fs'
import http from 'http'
import https from 'https'
import { resolve } from 'path'
import { Readable } from 'stream'
import { parse } from 'url'
import { merge } from 'lodash'

class Open extends Readable {
  constructor(url, options = {}) {
    super({ objectMode: true })
    this.options = merge({}, parse(url), options)
    this.options.protocol = this.options.protocol || 'file:'
  }
  _read() {
    switch (this.protocol) {
      case 'file:':
        const filepath = resolve(process.cwd(), this.options.pathname)
        return readFile(filepath, (error, buffer) => {
          if (error) {
            return this.push(error)
          }
          return this.push(null, buffer.toString())
        })
      case 'http:':
      case 'https:':
        const { request } = this.options.protocol === 'http' ? http : https
        request(this.options, (response) => {
          let data = ''
          response
            .on('error', (error) => {
              this.push(error)
            })
            .on('data', (chunk) => {
              data += chunk
            })
            .on('end', () => {
              this.push(data)
              this.push(null)
            })
        })
          .on('error', (error) => {
            this.push(error)
          })
          .end()
      default:
        return this.push(new Error(`Unsupported protocol: ${this.options.protocol}`))
    }
  }
}

export default function open(...args) {
  return new Open(...args)
}
