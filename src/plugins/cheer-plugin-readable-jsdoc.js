import { join } from 'path'
import { Readable } from 'stream'
import { promisify } from 'bluebird'
import { build, formats } from 'documentation'
import _, { castArray, find, findIndex, isEmpty, unary } from 'lodash'

const buildAsync = promisify(build)
const formatsMdAsync = promisify(formats.md)

class JSDoc extends Readable {
  constructor(indexes, {
    cwd = process.cwd(),
    tags = [],
  } = {}) {
    super({
      objectMode: true,
    })
    this.indexes = castArray(indexes).map(index => join(cwd, index))
    this.cwd = cwd
    this.tags = castArray(tags)
  }

  async _read() {
    if (this.pending) {
      return
    }
    this.pending = true
    const comments = await this.getComments()
    const filtered = this.filterComments(comments)
    const formatted = await this.formatComments(filtered)
    this.push(formatted)
    this.push(null)
  }

  getComments() {
    return buildAsync(this.indexes, {})
  }

  filterComments(comments) {
    return isEmpty(this.tags)
      ? comments
      : comments.filter(comment => this.tags.some(predicate => findIndex(comment.tags, predicate) > -1))
  }

  formatComments(comments) {
    return formatsMdAsync(comments, {})
  }
}

export default function cheerPluginReadableJSDoc({ cwd } = {}) {
  return {
    jsdoc: (indexes, options = {}) => new JSDoc(indexes, { cwd, ...options }),
  }
}
