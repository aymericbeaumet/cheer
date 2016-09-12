import { Transform } from 'stream'

class Stringify extends Tranform {
  constructor() {
    super({ objectMode: true })
  }
  _transform(value, _, done) {
    return done(null, typeof value === 'string' ? value : JSON.stringify(value))
  }
}

export default function stringify(...args) {
  return new Stringify(...args)
}
