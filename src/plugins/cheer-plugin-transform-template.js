import { template } from 'lodash'
import { Transform } from 'stream'

class Template extends Transform {
  constructor(...templateStrings) {
    super({ objectMode: true })
    this.compiled = template(templateStrings.join(''), {
      interpolate: /\${([\s\S]+)}/g,
    })
  }
  _transform(chunk, _, done) {
    return done(null, this.compiled(chunk))
  }
}

export default function cheerPluginTransformTemplate() {
  return {
    template: (...args) => new Template(...args),
  }
}
