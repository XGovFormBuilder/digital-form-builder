const fs = require('fs')
const hapi = require('@hapi/hapi')
const Blankie = require('blankie')
const Scooter = require('@hapi/scooter')
const config = require('./config')
const { configurePlugins } = require('./plugins/builder')
const Schmervice = require('schmervice')
const { NotifyService, PayService, UploadService, CacheService, catboxProvider, EmailService, WebhookService, SheetsService } = require('./lib/services')

const serverOptions = () => {
  const defaultOptions = {
    debug: { request: `${config.isDev}` },
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      security: {
        hsts: true,
        xss: true,
        noSniff: true,
        xframe: true
      }
    },
    cache: [{ provider: catboxProvider() }]
  }

  return config.sslKey && config.sslCert ? {
    ...defaultOptions,
    tls: {
      key: fs.readFileSync(config.sslKey),
      cert: fs.readFileSync(config.sslCert)
    }
  } : defaultOptions
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

  if (config.rateLimit) {
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
  }

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
      fontSrc: ['self', 'data:'],
      scriptSrc: (() => ['self', 'unsafe-inline'].concat(config.matomoUrl ? [config.matomoUrl] : []))(),
      styleSrc: ['self', 'unsafe-inline'],
      imgSrc: (() => ['self'].concat(config.matomoUrl ? [config.matomoUrl] : []))(),
      generateNonces: false
    }
  }])
  await server.register({
    plugin: require('@hapi/crumb'),
    options: {
      logUnauthorized: true,
      enforce: routeConfig ? routeConfig.enforceCsrf || false : !config.previewMode,
      cookieOptions: {
        path: '/',
        isSecure: !!config.sslKey
      },
      skip: request => {
        // skip crumb validation if error parsing payload
        return request.method === 'post' && request.payload == null
      }
    }
  })

  await server.register(Schmervice)
  server.registerService([CacheService, NotifyService, PayService, UploadService, EmailService, WebhookService, SheetsService])

  server.ext('onPreResponse', (request, h) => {
    if (request.response.isBoom) {
      return h.continue
    }

    if (request.response && request.response.header) {
      request.response.header('X-Robots-Tag', 'noindex, nofollow')

      const WEBFONT_EXTENSIONS = /\.(?:eot|ttf|woff|svg)$/i
      if (!WEBFONT_EXTENSIONS.test(request.url)) {
        request.response.header('cache-control', 'private, no-cache, no-store, must-revalidate, max-age=0')
        request.response.header('pragma', 'no-cache')
        request.response.header('expires', '0')
      }
    }
    return h.continue
  })

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
