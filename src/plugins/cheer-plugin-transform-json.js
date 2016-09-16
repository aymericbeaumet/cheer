import { Transform } from 'stream'
import { parse } from 'json5'
import { get } from 'lodash'

class JSON extends Transform {
  constructor(path = '') {
    super({ objectMode: true })
    this.path = path
  }
  _transform(text, _, done) {
    let object = null
    try {
      object = parse(text)
    } catch (error) {
      return done(error)
    }
    return done(null, get(object, this.path, object))
  }
}

export default function cheerPluginTransformJson() {
  return {
    json: (...args) => new JSON(...args),
  }
}
