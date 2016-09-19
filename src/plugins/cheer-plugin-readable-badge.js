import { stringify } from 'querystring'
import { Readable } from 'stream'
import { castArray, compact, isArray, isMap, isObject, isString, reduce } from 'lodash'

class Badge extends Readable {
  static ROOT = 'https://img.shields.io'

  static escape(string) {
    return string
      .replace(/-/g, '--')
      .replace(/_/g, '__')
      .replace(/ /g, '_')
  }

  static markdownFromArray([ type, args ], { extension, querystring }) {
    const imageAlt = type
    const imageSrc = `${Badge.ROOT}/${type}/${Array.from(args.values()).join('/')}.${extension}${querystring}`
    const image = `![${imageAlt}](${imageSrc})`
    if (type.startsWith('npm')) {
      return `[${image}](https://www.npmjs.com/package/${compact([ args.get('scope'), args.get('package') ]).join('/')})`
    }
    if (type.startsWith('travis')) {
      return `[${image}](https://travis-ci.org/${compact([ args.get('user'), args.get('repo') ]).join('/')})`
    }
    return image
  }

  static markdownFromObject({ subject, status, color, href, alt }, { extension, querystring }) {
    const imageAlt = alt || `${subject} | ${status}`
    const imageSrc = `${Badge.ROOT}/badge/${Badge.escape(subject)}-${Badge.escape(status)}-${color}.${extension}${querystring}`
    const image = `![${imageAlt}](${imageSrc})`
    if (href) {
      return `[${image}](${href})`
    }
    return image
  }

  constructor(badge, options = {}) {
    super({ objectMode: true })
    const { extension = 'svg', ...query } = options
    const querystring = Object.keys(query).length > 0 ? `?${stringify(options || {})}` : ''
    if (isString(badge) || isArray(badge)) {
      const [ type, args ] = castArray(badge)
      const normalizedArgs =
        isArray(args) ?
          new Map(args) :
        isObject(args) ?
          reduce(args, (map, v, k) => map.set(k, v), new Map()) :
        args ?
          args :
          new Map()
      this.markdown = Badge.markdownFromArray([ type, normalizedArgs ], {
        extension,
        querystring,
      })
      return
    }
    if (isObject(badge)) {
      this.markdown = Badge.markdownFromObject(badge, {
        extension,
        querystring,
      })
      return
    }
    this.emit('error', new Error(`Unsupported badge type: ${JSON.stringify(badge)}`))
  }

  _read() {
    if (this.markdown) {
      this.push(this.markdown)
      this.markdown = null
    }
    this.push(null)
  }
}

export default function cheerPluginReadableBadge() {
  return {
    badge: (...args) => new Badge(...args),
  }
}
