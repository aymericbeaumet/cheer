import { Readable } from 'stream'

class Raw extends Readable {
  constructor(...values) {
    super({ objectMode: true })
    this.values = values
  }
  _read() {
    this.push(this.values)
    this.push(null)
  }
}

export default function cheerPluginReadableRaw() {
  return {
    cheer: {
      raw: Raw,
    },
  }
}
