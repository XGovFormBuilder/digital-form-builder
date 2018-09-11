const glupe = require('glupe')
const path = require('path')
const nunjucks = require('nunjucks')
const pkg = require('../package.json')
const { getState, mergeState } = require('../server/db')
const serverPath = path.join(__dirname, '../server')

module.exports = (data) => {
  const manifest = {
    register: {
      plugins: [
        'inert',
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
            context: {
              appVersion: pkg.version,
              assetPath: '/assets',
              serviceName: 'Service name',
              pageTitle: 'Service name - GOV.UK'
            }
          }
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
          plugin: 'digital-form-builder-engine',
          options: { data, getState, mergeState, ordnanceSurveyKey: '' }
        },
        './plugins/error-pages'
      ]
    }
  }

  return glupe.compose(manifest, {
    relativeTo: serverPath
  })
}
