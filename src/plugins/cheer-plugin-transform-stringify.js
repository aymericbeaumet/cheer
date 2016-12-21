import {Transform} from 'stream'

class Stringify extends Transform {
  constructor() {
    super({objectMode: true})
  }
  _transform(value, _, done) {
    try {
      return done(null, typeof value === 'string' ? value : JSON.stringify(value))
    } catch (err) {
      return done(err)
    }
  }
}

export default function cheerPluginTransformStringify() {
  return {
    stringify: (...args) => new Stringify(...args)
  }
}
