import { Readable } from 'stream'

class JSDoc extends Readable {
  constructor() {
    super({ objectMode: true })
  }
  _read() {
    this.push('jsdoc')
    this.push(null)
  }
}

export default function cheerPluginReadableJSDoc() {
  return {
    jsdoc: (...args) => new JSDoc(...args),
  }
}
