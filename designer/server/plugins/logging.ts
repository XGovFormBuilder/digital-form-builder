import config from '../config'

export default {
  plugin: require('hapi-pino'),
  options: {
    prettyPrint: config.isDev,
    level: config.logLevel
  }
}
