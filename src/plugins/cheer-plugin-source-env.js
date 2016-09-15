import { Readable } from 'stream'

class Env extends Readable {
  constructor() {
    super({ objectMode: true })
  }
  _read() {
    this.push(process.env) // eslint-disable-line no-process-env
    this.push(null)
  }
}

export default function cheerPluginReadableEnv() {
  return {
    process: {
      env: Env,
    },
  }
}
