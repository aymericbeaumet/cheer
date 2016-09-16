import { merge } from 'lodash'
import env from './cheer-plugin-readable-env'
import open from './cheer-plugin-readable-open'
import raw from './cheer-plugin-readable-raw'
import json from './cheer-plugin-transform-json'
import template from './cheer-plugin-transform-template'
import stringify from './cheer-plugin-writable-stringify'

/**
 * Load the plugins.
 * @return {Object} - the plugins
 */
export default function plugins() {
  const builtins = [
    // readable
    env,
    open,
    raw,
    // transform
    json,
    template,
    // writable
    stringify,
  ]
  return builtins.reduce((acc, plugin) => merge({}, acc, plugin()), {})
}
