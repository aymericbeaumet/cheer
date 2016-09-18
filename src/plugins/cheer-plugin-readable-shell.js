import { Readable } from 'stream'
import { shell } from 'execa'

class Shell extends Readable {
  constructor(command, options = {}) {
    super({ objectMode: true })
    this.command = command
    this.options = {
      cwd: process.cwd(),
      env: process.env,
      ...options,
    }
  }
  async _read() {
    if (this.pending) {
      return
    }
    this.pending = true
    try {
      const { stdout } = await shell(this.command, this.options)
      this.push(stdout)
      this.push(null)
    } catch (error) {
      this.emit('error', error)
    }
  }
}

export default function cheerPluginReadableShell() {
  return {
    shell: (...args) => new Shell(...args),
  }
}
