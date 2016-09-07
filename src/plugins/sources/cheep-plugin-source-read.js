import { createReadStream } from 'fs'
import { resolve } from 'path'

export default function CheerPluginSourceOpen(filecontent, {
  cwd = process.cwd(),
} = {}) {
  return function open(url) {
    const filepath = resolve(cwd, file)
    return createReadStream(filepath)
  }
}
