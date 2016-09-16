import { Readable } from 'stream'

class Raw extends Readable {
  constructor(value) {
    super({ objectMode: true })
    this.value = value
  }
  _read() {
    this.push(this.value)
    this.push(null)
  }
}

export default function cheerPluginReadableRaw() {
  return {
    raw: (...args) => new Raw(...args),
  }
}
