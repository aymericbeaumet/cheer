import {Transform} from 'stream'
import {parse} from 'json5'
import {get} from 'lodash'

class JSONTransform extends Transform {
  constructor(path = '') {
    super({objectMode: true})
    this.path = path
  }
  _transform(text, _, done) {
    let object = null
    try {
      object = parse(text)
    } catch (err) {
      return done(err)
    }
    return done(null, get(object, this.path, object))
  }
}

export default function cheerPluginTransformJSON() {
  return {
    json: (...args) => new JSONTransform(...args)
  }
}
