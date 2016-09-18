import { merge } from 'lodash'
import badge from './cheer-plugin-readable-badge'
import env from './cheer-plugin-readable-env'
import jsdoc from './cheer-plugin-readable-jsdoc'
import open from './cheer-plugin-readable-open'
import raw from './cheer-plugin-readable-raw'
import shell from './cheer-plugin-readable-shell'
import json from './cheer-plugin-transform-json'
import stringify from './cheer-plugin-transform-stringify'
import template from './cheer-plugin-transform-template'
import yaml from './cheer-plugin-transform-yaml'

/**
 * Load the plugins.
 * @return {Object} - the plugins
 */
export default function plugins(options) {
  const builtins = [
    // readable
    badge,
    env,
    jsdoc,
    open,
    raw,
    shell,
    // transform
    json,
    stringify,
    template,
    yaml,
  ]
  return builtins.reduce((acc, plugin) => merge({}, acc, plugin(options)), {})
}
