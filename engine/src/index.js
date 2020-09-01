import { redirectTo } from './helpers'
import { RelativeUrl } from './feedback'
import { FormConfiguration } from '@xgovformbuilder/model'

const { nanoid } = require('nanoid')
const Boom = require('boom')
const pkg = require('../package.json')
const Model = require('./model')
const { SchemaMigrationService } = require('@xgovformbuilder/model')

function normalisePath (path) {
  return path
    .replace(/^\//, '')
    .replace(/\/$/, '')
}

function getStartPageRedirect (request, h, id, model) {
  const startPage = normalisePath(model.def.startPage)
  let startPageRedirect
  if (startPage.startsWith('http')) {
    startPageRedirect = redirectTo(request, h, startPage)
  } else {
    startPageRedirect = redirectTo(request, h, `/${id}/${startPage}`)
  }
  return startPageRedirect
}

function redirectWithVisitParameter (request, h) {
  const visitId = request.query[RelativeUrl.VISIT_IDENTIFIER_PARAMETER]
  if (!visitId) {
    const params = Object.assign({}, request.query)
    params[RelativeUrl.VISIT_IDENTIFIER_PARAMETER] = nanoid(10)
    return redirectTo(request, h, request.url.pathname, params)
  }
}

module.exports = {
  plugin: {
    name: pkg.name,
    version: pkg.version,
    dependencies: 'vision',
    multiple: true,
    register: (server, options) => {
      const { modelOptions, configs, previewMode } = options

      const schemaMigrationService = new SchemaMigrationService(server, options)
      /*
      * This plugin cannot be run outside of the context of the https://github.com/XGovFormBuilder/digital-form-builder project.
      * Ideally the engine encapsulates all the functionality required to run a form so work needs to be done to merge functionality
      * from the builder project.
      **/
      const forms = {}
      configs.forEach(config => {
        forms[config.id] = new Model(schemaMigrationService.migrate(config.configuration), { ...modelOptions, basePath: config.id })
      })

      if (previewMode) {
        /**
         * The following endpoints are used from the designer for operating in 'preview' mode.
         * I.E. Designs saved in the designer can be accessed in the runner for viewing.
         * The designer also uses these endpoints as a persistence mechanism for storing and retrieving data
         * for it's own purposes so if you're changing these endpoints you likely need to go and amend
         * the designer too!
         */
        server.route({
          method: 'post',
          path: '/publish',
          handler: (request, h) => {
            const { id, configuration } = request.payload
            const parsedConfiguration = typeof configuration === 'string' ? JSON.parse(configuration) : configuration
            const def = schemaMigrationService.migrate(parsedConfiguration)
            forms[id] = new Model(def, { ...modelOptions, basePath: id })
            return h.response({}).code(204)
          }
        })

        server.route({
          method: 'get',
          path: '/published/{id}',
          handler: (request, h) => {
            const { id } = request.params
            if (forms[id]) {
              const { values } = forms[id]
              return h.response(JSON.stringify({ id, values })).code(200)
            } else {
              return h.response({}).code(204)
            }
          }
        })

        server.route({
          method: 'get',
          path: '/published',
          handler: (request, h) => {
            return h.response(
              JSON.stringify(Object.keys(forms).map(key => new FormConfiguration(key, forms[key].name, undefined, forms[key].def.feedback?.feedbackForm)))
            )
              .code(200)
          }
        })
      }

      server.route({
        method: 'get',
        path: '/',
        handler: (request, h) => {
          function handle () {
            const keys = Object.keys(forms)
            let id = ''
            if (keys.length === 1) {
              id = keys[0]
            }
            const model = forms[id]
            if (model) {
              return getStartPageRedirect(request, h, id, model)
            }
            throw Boom.notFound('No default form found')
          }

          return redirectWithVisitParameter(request, h) || handle()
        }
      })

      server.route({
        method: 'get',
        path: '/{id}',
        handler: (request, h) => {
          function handle () {
            const { id } = request.params
            const model = forms[id]
            if (model) {
              return getStartPageRedirect(request, h, id, model)
            }
            throw Boom.notFound('No form found for id')
          }

          return redirectWithVisitParameter(request, h) || handle()
        }
      })

      server.route({
        method: 'get',
        path: '/{id}/{path*}',
        handler: (request, h) => {
          function handle () {
            const { path, id } = request.params
            const model = forms[id]
            if (model) {
              const page = model.pages.find(page => normalisePath(page.path) === normalisePath(path))
              if (page) {
                return page.makeGetRouteHandler()(request, h)
              }
              if (normalisePath(path) === '') {
                return getStartPageRedirect(request, h, id, model)
              }
            }
            throw Boom.notFound('No form or page found')
          }

          return redirectWithVisitParameter(request, h) || handle()
        }
      })

      const { uploadService } = server.services([])

      const handleFiles = (request, h) => {
        return uploadService.handleUploadRequest(request, h)
      }

      const postHandler = async (request, h) => {
        const { path, id } = request.params
        const model = forms[id]
        if (model) {
          const page = model.pages.find(page => page.path.replace(/^\//, '') === path)
          if (page) {
            return page.makePostRouteHandler()(request, h)
          }
        }
        throw Boom.notFound('No form of path found')
      }

      server.route({
        method: 'post',
        path: '/{id}/{path*}',
        options: {
          plugins: {
            'hapi-rate-limit': {
              userPathLimit: 10
            }
          },
          payload: {
            output: 'stream',
            parse: true,
            multipart: true,
            maxBytes: uploadService.fileSizeLimit,
            failAction: async (request, h) => {
              if (request.server.plugins.crumb && request.server.plugins.crumb.generate) {
                request.server.plugins.crumb.generate(request, h)
              }
              return h.continue
            }
          },
          pre: [{ method: handleFiles }],
          handler: postHandler
        }
      })
    }
  }
}
