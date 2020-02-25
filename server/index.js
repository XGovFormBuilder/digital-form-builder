const fs = require('fs')
const hapi = require('@hapi/hapi')
const Blankie = require('blankie')
const Scooter = require('@hapi/scooter')
const config = require('./config')
const { configurePlugins } = require('./plugins/builder')
const Schmervice = require('schmervice')
const { NotifyService, PayService, UploadService, CacheService, catboxProvider, EmailService, WebhookService } = require('./lib/services')

const serverOptions = () => {
  const defaultOptions = {
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
    cache: [{ provider: catboxProvider() }]
  }

  return config.sslKey && config.sslCert ? { ...defaultOptions,
    tls: {
      key: fs.readFileSync(config.sslKey),
      cert: fs.readFileSync(config.sslCert)
    } } : defaultOptions
}

/**
 * Create a server with the default configurations
 * @param {Object} [routeConfig] - Alternative configuration. Use ful for testing or running a specific route only.
 * @param {Object} [routeConfig.rateOptions] - Options object for the plugin 'hapi-rate-limit'.
 * @param {string} [routeConfig.data] - The filename of a form configuration.
 * @param {string} [routeConfig.customPath] - The path to routeConfig.data.
 */
async function createServer (routeConfig) {
  const server = hapi.server(serverOptions())

  await server.register({
    plugin: require('hapi-rate-limit'),
    options: routeConfig ? routeConfig.rateOptions || { enabled: false } : {
      trustProxy: true,
      pathLimit: false,
      userLimit: false,
      getIpFromProxyHeader: (header) => {
        // use the last in the list as this will be the 'real' ELB header
        const ips = header.split(',')
        return ips[ips.length - 1]
      }
    }
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
      styleSrc: ['self', 'unsafe-inline'],
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
  server.registerService([CacheService, NotifyService, PayService, UploadService, EmailService, WebhookService])

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
  if (!config.isTest) {
    await server.register(require('blipp'))
  }
  await server.register(require('./plugins/logging'))

  return server
}

module.exports = createServer
