import { Readable } from 'stream'

class Badge extends Readable {
  constructor() {
    super({ objectMode: true })
  }
  _read() {
    this.push('badge')
    this.push(null)
  }
}

export default function cheerPluginReadableBadge() {
  return {
    badge: (...args) => new Badge(...args),
  }
}
