import { Readable } from 'stream'

class Raw extends Readable {
  constructor() {
    super({ objectMode: true })
  }
  _read() {
    this.push(process.env) // eslint-disable-line no-process-env
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
