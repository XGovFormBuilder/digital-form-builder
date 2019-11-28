const hapi = require('@hapi/hapi')
const Blankie = require('blankie')
const Scooter = require('@hapi/scooter')
const config = require('./config')
const fs = require('fs')
const { pay } = require('./plugins/pay')
const { configurePlugins, routes } = require('./plugins/builder')
const Schmervice = require('schmervice')
const { NotifyService } = require('./lib/notifyService')

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

  return isDev && fs.existsSync('/keybase/team/cautionyourblast/fco/') ? { ...defaultOptions,
    tls: {
      key: fs.readFileSync('/keybase/team/cautionyourblast/fco/localhost-key.pem'),
      cert: fs.readFileSync('/keybase/team/cautionyourblast/fco/localhost.pem')
    } } : defaultOptions
}

async function createServer (routeConfig) {
  const server = hapi.server(serverOptions(config.isDev))
  server.register({
    plugin: require('hapi-graceful-pm2'),
    options: {
      timeout: 4000
    }
  }).then(() => console.log('restarted'))

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
  await server.register({
    plugin: require('@hapi/crumb'),
    options: {
      enforce: routeConfig ? routeConfig.enforceCsrf || false : true
    }
  })
  await server.register(Schmervice)
  server.registerService(NotifyService)

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
