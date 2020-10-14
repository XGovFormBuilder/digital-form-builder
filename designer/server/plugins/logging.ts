import config from '../config'
import pino from 'hapi-pino'

console.log('XXXXPINO', pino)

export default {
  plugin: pino,
  options: {
    prettyPrint: config.isDev,
    level: config.logLevel
  }
}
