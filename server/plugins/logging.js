const config = require('../config')

module.exports = {
  plugin: require('hapi-pino'),
  options: {
    prettyPrint: config.isDev,
    level: config.logLevel
  }
}
