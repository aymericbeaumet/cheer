import { Readable } from 'stream'
import util from 'util'

export default function CheerPluginSourceFormat(filecontent, {
} = {}) {
  return function format(format, ...args) {
    const stream = new Readable()
    stream.push(
      util.format(format, ...args)
    )
    stream.push(null)
    return stream
  }
}
