const path = require('path')
const nunjucks = require('nunjucks')
const config = require('../config')
const pkg = require('../package.json')
const { getState, mergeState } = require('./db')

const analyticsAccount = config.analyticsAccount
const dataFilePath = path.join(__dirname, './govsite.json')
const data = require(dataFilePath)

const viewsContext = {
  appVersion: pkg.version,
  assetPath: '/assets',
  serviceName: 'Service name',
  pageTitle: 'Service name - GOV.UK',
  analyticsAccount: analyticsAccount,
  BROWSER_REFRESH_URL: process.env.BROWSER_REFRESH_URL
}

const manifest = {
  server: {
    port: process.env.PORT || config.server.port,
    host: process.env.HOST || config.server.host,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  },
  register: {
    plugins: [
      'inert',
      {
        plugin: 'good',
        options: config.logging
      },
      {
        plugin: 'yar',
        options: {
          cookieOptions: {
            password: Array(32).fill(0).map(x => Math.random().toString(36).charAt(2)).join(''),
            isSecure: false,
            isHttpOnly: true
          }
        }
      },
      {
        plugin: 'vision',
        options: {
          engines: {
            njk: {
              compile: (src, options) => {
                const template = nunjucks.compile(src, options.environment)

                return (context) => {
                  const html = template.render(context /* , function (err, value) {
                    console.error(err)
                  } */)
                  return html
                }
              },

              prepare: (options, next) => {
                const env = nunjucks.configure(options.path, {
                  autoescape: true,
                  watch: false // ,
                  // throwOnUndefined: true
                })

                env.addGlobal('getContext', function (component, errors) {
                  const ctx = this.ctx
                  return ctx && ctx.toString()
                })

                options.compileOptions.environment = env

                return next()
              }
            }
          },
          path: [
            'server/views',
            'node_modules/govuk-frontend/',
            'node_modules/govuk-frontend/components/',
            'node_modules/digital-form-builder-engine/views',
            'node_modules/digital-form-builder-designer/views'
          ],
          isCached: config.views.cache,
          context: viewsContext
        }
      },
      {
        plugin: 'digital-form-builder-engine',
        options: { data: data, getState, mergeState, ordnanceSurveyKey: config.ordnanceSurveyKey }
      },
      {
        plugin: 'digital-form-builder-designer',
        options: { path: dataFilePath }
      },
      './plugins/router',
      './plugins/error-pages'
    ]
  }
}

module.exports = manifest
