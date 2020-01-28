const fs = require('fs')
const hapi = require('@hapi/hapi')
const Blankie = require('blankie')
const Scooter = require('@hapi/scooter')
const config = require('./config')
const { configurePlugins } = require('./plugins/builder')
const Schmervice = require('schmervice')
const { NotifyService } = require('./lib/notifyService')
const { PayService } = require('./lib/payService')
const { UploadService } = require('./lib/documentUpload')

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

  await server.register({
    plugin: require('hapi-rate-limit'),
    options: routeConfig ? routeConfig.rateOptions || { enabled: false } : { }
  })
  await server.register({
    plugin: require('hapi-pulse'),
    options: {
      timeout: 800
    }
  })
  await server.register(require('inert'))
  await server.register([Scooter, {
    plugin: Blankie,
    options: {
      fontSrc: 'self',
      scriptSrc: (() => ['self', 'unsafe-inline'].concat(config.matomoUrl ? [config.matomoUrl] : []))(),
      styleSrc: ['self'],
      imgSrc: (() => ['self'].concat(config.matomoUrl ? [config.matomoUrl] : []))(),
      generateNonces: false
    }
  }])
  await server.register({
    plugin: require('@hapi/crumb'),
    options: {
      enforce: routeConfig ? routeConfig.enforceCsrf || false : !config.previewMode
    }
  })
  await server.register(Schmervice)
  server.registerService([NotifyService, PayService, UploadService])

  await server.register(require('./plugins/locale'))
  await server.register(require('./plugins/session'))
  await server.register(require('./plugins/views'))

  if (routeConfig) {
    await server.register(configurePlugins(routeConfig.data, routeConfig.customPath))
  } else {
    await server.register(configurePlugins())
  }
  await server.register(require('./plugins/applicationStatus'))
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))

  await server.register(require('blipp'))
  await server.register(require('./plugins/logging'))

  return server
}

module.exports = createServer
