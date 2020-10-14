import pkg from '../../package.json'
import nunjucks from 'nunjucks'

export const viewPlugin = {
  plugin: require('vision'),
  options: {
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)
          return (context) => {
            if (context.nonce) {
              delete Object.assign(context, { script_nonce: context['script-nonce'] })['script-nonce']
              delete Object.assign(context, { style_nonce: context.style_nonce }).style_nonce
            }

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
      'dist/client'
    ],
    context: {
      appVersion: pkg.version,
      assetPath: '/assets'
    }
  }
}