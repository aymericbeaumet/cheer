import { Writable } from 'stream'

class Stringify extends Writable {
  constructor() {
    super({ objectMode: true })
  }
  _write(value, _, done) {
    try {
      this.value = typeof value === 'string' ? value : JSON.stringify(value)
    } catch (error) {
      return done(error)
    }
    return done(null)
  }
  toString() {
    return this.value
  }
}

export default function stringify(...args) {
  return new Stringify(...args)
}
