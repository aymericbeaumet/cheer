import { exec } from 'child_process'
import { Readable } from 'stream'

class Shell extends Readable {
  constructor(command, options = {}) {
    super({ objectMode: true })
    this.command = command
    this.options = Object.assign({
      cwd: process.cwd,
      env: process.env,
    }, options)
  }
  _read() {
    if (this.pending) {
      return
    }
    exec(this.command, this.options, (error, stdout, stderr) => {
      if (error) {
        return this.emit('error', error)
      }
      this.push(stdout.toString())
      this.push(null)
    })
  }
}

export default function cheerPluginReadableShell() {
  return {
    shell: (...args) => new Shell(...args),
  }
}
