import { Transform } from 'stream'
import JSON5 from 'json5'
import { get } from 'lodash'

class Json extends Transform {
  constructor(path = '') {
    super({ objectMode: true })
    this.path = path
  }
  _transform(text, _, done) {
    let object = null
    try {
      object = JSON5.parse(text)
    } catch (error) {
      return done(error)
    }
    return done(null, get(object, this.path, object))
  }
}

export default function cheerPluginTransformJson() {
  return {
    json: (...args) => new Json(...args),
  }
}
