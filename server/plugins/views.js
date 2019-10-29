const nunjucks = require('nunjucks')
const config = require('../config')
const pkg = require('../../package.json')

module.exports = {
  plugin: require('vision'),
  options: {
    engines: {
      html: {
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
          options.compileOptions.environment = nunjucks.configure(options.path, {
            autoescape: true,
            watch: false
          })

          return next()
        }
      }
    },
    path: [
      'server/views',
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/digital-form-builder-engine/views',
      'node_modules/digital-form-builder-designer/views',
      'node_modules/hmpo-components/components'
    ],
    isCached: !config.isDev,
    context: {
      appVersion: pkg.version,
      assetPath: '/assets',
      serviceName: config.serviceName,
      pageTitle: 'Service name - GOV.UK',
      analyticsAccount: config.analyticsAccount,
      matomoId: config.matomoId,
      BROWSER_REFRESH_URL: config.browserRefreshUrl
    }
  }
}
