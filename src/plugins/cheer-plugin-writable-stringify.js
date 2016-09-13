import { Writable } from 'stream'

class Stringify extends Writable {
  constructor() {
    super({ objectMode: true })
  }
  _write(value, _, done) {
    try {
      this.value = typeof value === 'string' ? value : JSON.stringify(value)
      return done(null)
    } catch (error) {
      return done(error)
    }
  }
  toString() {
    return this.value
  }
}

export default function cheerPluginWritableStringify() {
  return {
    cheer: {
      stringify: Stringify,
    },
  }
}
