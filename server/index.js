const hapi = require('hapi')
const Blankie = require('blankie')
const Scooter = require('@hapi/scooter')
const config = require('./config')
const fs = require('fs')
const { pay } = require('./plugins/pay')
const { configurePlugins, routes } = require('./plugins/builder')

const serverOptions = (isDev) => {
  const defaultOptions = {
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  }
  return isDev ? { ...defaultOptions,
    tls: {
      key: fs.readFileSync('/keybase/team/cautionyourblast/fco/localhost-key.pem'),
      cert: fs.readFileSync('/keybase/team/cautionyourblast/fco/localhost.pem')
    } } : defaultOptions
}

async function createServer (routeConfig) {
  const server = hapi.server(serverOptions(config.isDev))
  await server.register(require('inert'))
  await server.register([Scooter, {
    plugin: Blankie,
    options: {
      fontSrc: 'self',
      scriptSrc: ['self', 'https://cdn.matomo.cloud', 'unsafe-inline'],
      styleSrc: ['self'],
      imgSrc: ['self', 'https://*.matomo.cloud'],
      generateNonces: false
    }
  }])
  await server.register(require('@hapi/crumb'))
  await server.register(require('./plugins/locale'))
  await server.register(require('./plugins/session'))
  await server.register(require('./plugins/views'))
  if (routeConfig) {
    await server.register(configurePlugins(routeConfig.data, routeConfig.customPath))
  } else {
    await server.register(routes())
  }
  await server.register(pay)
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))

  await server.register(require('blipp'))
  await server.register(require('./plugins/logging'))

  return server
}

module.exports = createServer
