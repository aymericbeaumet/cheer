import {Transform} from 'stream'
import {load} from 'js-yaml'
import {get} from 'lodash'

class YAML extends Transform {
  constructor(path = '') {
    super({objectMode: true})
    this.path = path
  }
  _transform(text, _, done) {
    let object = null
    try {
      object = load(text)
    } catch (err) {
      return done(err)
    }
    return done(null, get(object, this.path, object))
  }
}

export default function cheerPluginTransformYAML() {
  return {
    yaml: (...args) => new YAML(...args)
  }
}
