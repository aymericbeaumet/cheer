import { Readable } from 'stream'

function CheerPluginSourceRaw({
} = {}) {
  return function raw(string) {
    const stream = new Readable()
    stream.push(string)
    stream.push(null)
    return stream
  }
}
