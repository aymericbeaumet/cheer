import { Readable } from 'stream'

export default function CheerPluginSourceJs(filecontent, {
} = {}) {
  return function js(expression) {
    const stream = new Readable()
    stream.push(
      JSON.stringify(eval(expression))
    )
    stream.push(null)
    return stream
  }
}
