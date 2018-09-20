const hapi = require('hapi')
const config = require('./config')

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  })

  // Register the plugins
  await server.register(require('inert'))
  await server.register(require('./plugins/session'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/builder'))
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))

  if (config.isDev) {
    await server.register(require('blipp'))
    await server.register(require('./plugins/logging'))
  }

  return server
}

module.exports = createServer
