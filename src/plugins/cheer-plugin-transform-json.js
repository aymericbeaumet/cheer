import { Transform } from 'stream'

class Json extends Transform {
  constructor(text) {
    super({ objectMode: true })
  }
  _transform(text, _, done) {
    return done(null, JSON.parse(text))
  }
}

export default function cheerPluginTransformJson() {
  return {
    cheer: {
      json: Json,
    },
  }
}
