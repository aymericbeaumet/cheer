import { join } from 'path'
import { Readable } from 'stream'
import { promisify } from 'bluebird'
import { build, formats } from 'documentation'
import _, { castArray, find, findIndex, isEmpty, unary, upperFirst } from 'lodash'

const buildAsync = promisify(build)
const formatsMdAsync = promisify(formats.md)

class JSDoc extends Readable {
  constructor(indexes, {
    cwd = process.cwd(),
    hlevel = 1,
    tags = [],
  } = {}) {
    super({
      objectMode: true,
    })
    this.indexes = castArray(indexes).map(index => join(cwd, index))
    this.cwd = cwd
    this.hlevel = hlevel
    this.tags = castArray(tags)
  }

  async _read() {
    if (this.pending) {
      return
    }
    this.pending = true
    const comments = await this.getComments()
    const filtered = this.filterComments(comments)
    const formatted = this.formatComments(filtered)
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
    return comments.map(::this.formatComment).join('\n\n')
  }

  formatComment(comment) {
    return [
      this.formatTitle(comment),
      '',
      this.formatDescription(comment.description).join('\n\n'),
      '',
      this.formatArguments(comment.params),
      '',
      this.formatReturns(comment.returns),
    ].join('\n')
  }

  formatTitle(comment) {
    const h = Array((this.hlevel + 0) + 1).join('#')
    const path = _(comment.path).map('name').join('.')
    const args = comment.kind !== 'function'
      ? ''
      : `(${_(comment.params).map('name').join(', ')})`
    return `${h} \`${path}${args}\``
  }

  formatArguments(args) {
    return [
      ...args.map(::this.formatArgument),
    ].join('\n')
  }

  formatArgument(arg, { level = 0 } = {}) {
    const indent = Array(level + 1).join('  ')
    const name = arg.name
    const type = this.formatType(arg.type)
    const description = !arg.description
      ? ''
      : ' &#x2014; ' + upperFirst(this.formatDescription(arg.description).join(' '))
    return `${indent}- **${name}**: <code><em>${type}</em></code>${description}`
  }

  formatReturns(returns) {
    return returns.map(::this.formatReturn).join('\n')
  }

  formatReturn(ret) {
    const type = this.formatType(ret.type)
    const description = !ret.description
      ? ''
      : ' &#x2014; ' + upperFirst(this.formatDescription(ret.description).join(' '))
    return `Returns <code><em>${type}</em></code>${description}`
  }

  formatDescription(description) {
    return _(description.children)
      .filter({ type: 'paragraph' })
      .flatMap('children')
      .filter({ type: 'text' })
      .map('value')
  }

  formatType(type) {
    if (!type) {
      return this.formatType({ type: 'NameExpression', name: 'any' })
    }
    switch (type.type) {
      case 'TypeApplication':
      case 'OptionalType': {
        const expression = this.formatType(type.expression)
        const applications = type.applications ? `&lt;${type.applications.map(::this.formatType).join('|')}&gt;` : ''
        return `${expression}${applications}`
      }
      case 'UnionType': {
        return type.elements.map(::this.formatType).join('|')
      }
      case 'NameExpression': {
        switch (type.name.toLowerCase().trim()) {
          // various
            case 'any':                          return '[any](https://flowtype.org/docs/quick-reference.html#any)'
            case 'void':                         return '[void](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void)'
          // standard
            // value properties
            case 'infinity':                     return '[Infinity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Infinity)'
            case 'nan':                          return '[NaN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN)'
            case 'undefined':                    return '[undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)'
            case 'null':                         return '[null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)'
            // fundamental objects
            case 'object':                       return '[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)'
            case 'function':                     return '[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)'
            case 'boolean':
            case    'bool':                      return '[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)'
            case 'symbol':                       return '[Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)'
            // errors
            case 'error':                        return '[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)'
            case 'evalerror':                    return '[EvalError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/EvalError)'
            case 'internalerror':                return '[InternalError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/InternalError)'
            case 'rangeerror':                   return '[RangeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError)'
            case 'referenceerror':               return '[ReferenceError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ReferenceError)'
            case 'syntaxerror':                  return '[SyntaxError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError)'
            case 'typeerror':                    return '[TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)'
            case 'urierror':                     return '[URIError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/URIError)'
            // number and dates
            case 'date':                         return '[Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)'
            case 'math':                         return '[Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)'
            case 'number':                       return '[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)'
            // text processing
            case 'string':                       return '[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)'
            case 'regexp':                       return '[RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)'
            // indexed collections
            case 'array':                        return '[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)'
            case 'float32array':                 return '[Float32Array](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Float32Array)'
            case 'float64array':                 return '[Float64Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array)'
            case 'int16array':                   return '[Int16Array](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Int16Array)'
            case 'int32array':                   return '[Int32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array)'
            case 'int8array':                    return '[Int8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array)'
            case 'uint16array':                  return '[Uint16Array](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array)'
            case 'uint32array':                  return '[Uint32Array](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array)'
            case 'uint8array':                   return '[Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)'
            case 'uint8clampedarray':            return '[Uint8ClampedArray](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray)'
            // keyed collection
            case 'map':                          return '[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)'
            case 'set':                          return '[Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)'
            case 'weakmap':                      return '[WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)'
            case 'weakset':                      return '[WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)'
            // vector collection
            case 'simd':                         return '[SIMD](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SIMD)'
            case 'simd.bool8x16':
            case      'bool8x16':                return '[SIMD.Bool8x16](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Bool8x16)'
            case 'simd.bool16x8':
            case      'bool16x8':                return '[SIMD.Bool16x8](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Bool16x8)'
            case 'simd.bool32x4':
            case      'bool32x4':                return '[SIMD.Bool32x4](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Bool32x4)'
            case 'simd.bool64x2':
            case      'bool64x2':                return '[SIMD.Bool64x2](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Bool64x2)'
            case 'simd.float32x4':
            case      'float32x4':               return '[SIMD.Float32x4](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32x4)'
            case 'simd.float64x2':
            case      'float64x2':               return '[SIMD.Float64x2](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64x2)'
            case 'simd.int8x16':
            case      'int8x16':                 return '[SIMD.Int8x16](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8x16)'
            case 'simd.int16x8':
            case      'int16x8':                 return '[SIMD.Int16x8](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16x8)'
            case 'simd.int32x4':
            case      'int32x4':                 return '[SIMD.Int32x4](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32x4)'
            case 'simd.uint8x16':
            case      'uint8x16':                return '[SIMD.Uint8x16](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8x16)'
            case 'simd.uint16x8':
            case      'uint16x8':                return '[SIMD.Uint16x8](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16x8)'
            case 'simd.uint32x4':
            case      'uint32x4':                return '[SIMD.Uint32x4](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32x4)'
            // structured data
            case 'arraybuffer':                  return '[ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)'
            case 'sharedarraybuffer':            return '[SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)'
            case 'atomics':                      return '[Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)'
            case 'dataview':                     return '[DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)'
            case 'json':                         return '[JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)'
            // control abstraction objects
            case 'generator':                    return '[Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)'
            case 'generatorfunction':            return '[GeneratorFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction)'
            case 'promise':                      return '[Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)'
            // reflection
            case 'proxy':                        return '[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)'
            case 'reflect':                      return '[Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)'
            // internationalization
            case 'intl':                         return '[Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)'
            case 'intl.collator':                return '[Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator)'
            case 'intl.datetimeformat':          return '[Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)'
            case 'intl.numberformat':            return '[Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat)'
            // non-standard objects
            case 'iterator':                     return '[Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator)'
            case 'parallelarray':                return '[ParallelArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ParallelArray)'
            case 'stopiteration':                return '[StopIteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/StopIteration)'
          // node.js
            // buffer
            case 'buffer.buffer':
            case        'buffer':                return '[buffer.Buffer](https://nodejs.org/api/buffer.html#buffer_class_buffer)'
            case 'buffer.slowbuffer':
            case        'slowbuffer':            return '[buffer.SlowBuffer](https://nodejs.org/api/buffer.html#buffer_class_slowbuffer)'
            // child_process
            case 'child_process.childprocess':
            case               'childprocess':   return '[child_process.ChildProcess](https://nodejs.org/api/child_process.html#child_process_class_childprocess)'
            // cluster
            case 'cluster.worker':
            case         'worker':               return '[cluster.Worker](https://nodejs.org/api/cluster.html#cluster_class_worker)'
            // console
            case 'console.console':
            case         'console':              return '[console.Console](https://nodejs.org/api/console.html#console_class_console)'
            // crypto
            case 'crypto.certificate':
            case        'certificate':           return '[crypto.Certificate](https://nodejs.org/api/crypto.html#crypto_class_certificate)'
            case 'crypto.cipher':
            case        'cipher':                return '[crypto.Cipher](https://nodejs.org/api/crypto.html#crypto_class_cipher)'
            case 'crypto.decipher':
            case        'decipher':              return '[crypto.Decipher](https://nodejs.org/api/crypto.html#crypto_class_decipher)'
            case 'crypto.diffiehellman':
            case        'diffiehellman':         return '[crypto.DiffieHellman](https://nodejs.org/api/crypto.html#crypto_class_diffiehellman)'
            case 'crypto.ecdh':
            case        'ecdh':                  return '[crypto.ECDH](https://nodejs.org/api/crypto.html#crypto_class_ecdh)'
            case 'crypto.hash':
            case        'hash':                  return '[crypto.Hash](https://nodejs.org/api/crypto.html#crypto_class_hash)'
            case 'crypto.hmac':
            case        'hmac':                  return '[crypto.Hmac](https://nodejs.org/api/crypto.html#crypto_class_hmac)'
            case 'crypto.sign':
            case        'sign':                  return '[crypto.Sign](https://nodejs.org/api/crypto.html#crypto_class_sign)'
            case 'crypto.verify':
            case        'verify':                return '[crypto.Verify](https://nodejs.org/api/crypto.html#crypto_class_verify)'
            // domain
            case 'domain.domain':
            case        'domain':                return '[domain.Domain](https://nodejs.org/api/domain.html#domain_class_domain)'
            // events
            case 'events.eventemitter':
            case        'eventemitter':          return '[events.EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)'
            // fs
            case 'fs.fswatcher':
            case    'fswatcher':                 return '[fs.FSWatcher](https://nodejs.org/api/fs.html#fs_class_fs_fswatcher)'
            case 'fs.readstream':
            case    'readstream':                return '[fs.ReadStream](https://nodejs.org/api/fs.html#fs_class_fs_readstream)'
            case 'fs.stats':
            case    'stats':                     return '[fs.Stats](https://nodejs.org/api/fs.html#fs_class_fs_stats)'
            case 'fs.writestream':
            case    'writestream':               return '[fs.WriteStream](https://nodejs.org/api/fs.html#fs_class_fs_writestream)'
            // http
            case 'http.agent':
            case      'agent':                   return '[http.Agent](https://nodejs.org/api/http.html#http_class_http_agent)'
            case 'http.clientrequest':
            case      'clientrequest':           return '[http.ClientRequest](https://nodejs.org/api/http.html#http_class_http_clientrequest)'
            case 'http.server':
            case      'server':                  return '[http.Server](https://nodejs.org/api/http.html#http_class_http_server)'
            case 'http.serverresponse':
            case      'serverresponse':          return '[http.ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse)'
            case 'http.incomingmessage':
            case      'incomingmessage':         return '[http.IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)'
            // https
            case 'https.agent':                  return '[https.Agent](https://nodejs.org/api/https.html#https_class_https_agent)'
            case 'https.server':                 return '[https.Server](https://nodejs.org/api/https.html#https_class_https_server)'
            // net
            case 'net.server':                   return '[net.Server](https://nodejs.org/api/net.html#net_class_net_server)'
            case 'net.socket':
            case     'socket':                   return '[net.Socket](https://nodejs.org/api/net.html#net_class_net_socket)'
            // readline
            case 'readline.interface':
            case          'interface':           return '[readline.Interface](https://nodejs.org/api/readline.html#readline_class_interface)'
            // repl
            case 'repl.replserver':
            case      'replserver':              return '[repl.REPLServer](https://nodejs.org/api/repl.html#repl_class_replserver)'
            // stream
            case 'stream.writable':
            case        'writable':              return '[stream.Writable](https://nodejs.org/api/stream.html#stream_class_stream_writable)'
            case 'stream.readable':
            case        'readable':              return '[stream.Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable)'
            case 'stream.duplex':
            case        'duplex':                return '[stream.Duplex](https://nodejs.org/api/stream.html#stream_class_stream_duplex)'
            case 'stream.transform':
            case        'transform':             return '[stream.Transform](https://nodejs.org/api/stream.html#stream_class_stream_transform)'
            case 'stream.passthrough':
            case        'passthrough':           return '[stream.PassThrough](https://nodejs.org/api/stream.html#stream_class_stream_passthrough)'
            // string_decoder
            case 'string_decoder.stringdecoder':
            case                'stringdecoder': return '[string_decoder.StringDecoder](https://nodejs.org/api/string_decoder.html#string_decoder_class_new_stringdecoder_encoding)'
            // timers
            case 'timers.immediate':
            case        'immediate':             return '[timers.Immediate](https://nodejs.org/api/timers.html#timers_class_immediate)'
            case 'timers.timeout':
            case        'timeout':               return '[timers.Timeout](https://nodejs.org/api/timers.html#timers_class_timeout)'
            // tls
            case 'tls.server':                   return '[tls.Server](https://nodejs.org/api/tls.html#tls_class_tls_server)'
            case 'tls.tlssocket':
            case     'tlssocket':                return '[tls.TLSSocket](https://nodejs.org/api/tls.html#tls_class_tls_tlssocket)'
            case 'tls.cryptostream':
            case     'cryptostream':             return '[tls.CryptoStream](https://nodejs.org/api/tls.html#tls_class_cryptostream)'
            case 'tls.securepair':
            case     'securepair':               return '[tls.SecurePair](https://nodejs.org/api/tls.html#tls_class_securepair)'
            // tty
            case 'tty.readstream':               return '[tty.ReadStream](https://nodejs.org/api/tty.html#tty_class_tty_readstream)'
            case 'tty.writestream':              return '[tty.WriteStream](https://nodejs.org/api/tty.html#tty_class_tty_writestream)'
            // dgram
            case 'dgram.socket':                 return '[dgram.Socket](https://nodejs.org/api/dgram.html#dgram_class_dgram_socket)'
            // vm
            case 'vm.script':
            case    'script':                    return '[vm.Script](https://nodejs.org/api/vm.html#vm_class_vm_script)'
            // zlib
            case 'zlib.deflate':
            case      'deflate':                 return '[zlib.Deflate](https://nodejs.org/api/zlib.html#zlib_class_zlib_deflate)'
            case 'zlib.deflateRaw':
            case      'deflateRaw':              return '[zlib.DeflateRaw](https://nodejs.org/api/zlib.html#zlib_class_zlib_deflateraw)'
            case 'zlib.gunzip':
            case      'gunzip':                  return '[zlib.Gunzip](https://nodejs.org/api/zlib.html#zlib_class_zlib_gunzip)'
            case 'zlib.gzip':
            case      'gzip':                    return '[zlib.Gzip](https://nodejs.org/api/zlib.html#zlib_class_zlib_gzip)'
            case 'zlib.inflate':
            case      'inflate':                 return '[zlib.Inflate](https://nodejs.org/api/zlib.html#zlib_class_zlib_inflate)'
            case 'zlib.inflateraw':
            case      'inflateraw':              return '[zlib.InflateRaw](https://nodejs.org/api/zlib.html#zlib_class_zlib_inflateraw)'
            case 'zlib.unzip':
            case      'unzip':                   return '[zlib.Unzip](https://nodejs.org/api/zlib.html#zlib_class_zlib_unzip)'
            case 'zlib.zlib':
            case      'zlib':                    return '[zlib.Zlib](https://nodejs.org/api/zlib.html#zlib_class_zlib_zlib)'
          // fallback
            default:                             return type.name
        }
      }
      default: {
        return ''
      }
    }
  }
}

export default function cheerPluginReadableJSDoc({ cwd } = {}) {
  return {
    jsdoc: (indexes, options = {}) => new JSDoc(indexes, { cwd, ...options }),
  }
}
