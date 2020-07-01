const Boom = require('boom')
const pkg = require('../package.json')
const Model = require('./model')

// 5mb
const UPLOAD_LIMIT = 5 * 1024 * 1024

function normalisePath (path) {
  return path
    .replace(/^\//, '')
    .replace(/\/$/, '')
}

function getStartPageRedirect (h, id, model) {
  const startPage = normalisePath(model.def.startPage)
  let startPageRedirect
  if (startPage.startsWith('http')) {
    startPageRedirect = h.redirect(startPage)
  } else {
    startPageRedirect = h.redirect(`/${id}/${startPage}`)
  }
  return startPageRedirect
}

module.exports = {
  plugin: {
    name: pkg.name,
    version: pkg.version,
    dependencies: 'vision',
    multiple: true,
    register: (server, options) => {
      const { modelOptions, configs, previewMode } = options
      /*
      * This plugin cannot be run outside of the context of the https://github.com/UKForeignOffice/digital-form-builder project.
      * Ideally the engine encapsulates all the functionality required to run a form so work needs to be done to merge functionality
      * from the builder project.
      **/
      const forms = {}
      configs.forEach(config => {
        forms[config.id] = new Model(config.configuration, { ...modelOptions, basePath: config.id })
      })

      if (previewMode) {
        server.route({
          method: 'post',
          path: '/publish',
          handler: (request, h) => {
            const { id, configuration } = request.payload
            forms[id] = new Model(configuration, { ...modelOptions, basePath: id })
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
      }

      server.route({
        method: 'get',
        path: `/`,
        handler: (request, h) => {
          const keys = Object.keys(forms)
          let id = ''
          if (keys.length === 1) {
            id = keys[0]
          }
          const model = forms[id]
          if (model) {
            return getStartPageRedirect(h, id, model)
          }
          throw Boom.notFound('No default form found')
        }
      })

      server.route({
        method: 'get',
        path: `/{id}`,
        handler: (request, h) => {
          const { id } = request.params
          const model = forms[id]
          if (model) {
            return getStartPageRedirect(h, id, model)
          }
          throw Boom.notFound('No form found for id')
        }
      })

      server.route({
        method: 'get',
        path: `/{id}/{path*}`,
        handler: (request, h) => {
          const { path, id } = request.params
          const model = forms[id]
          if (model) {
            const page = model.pages.find(page => normalisePath(page.path) === normalisePath(path))
            if (page) {
              return page.makeGetRouteHandler()(request, h)
            }
            if (normalisePath(path) === '') {
              return getStartPageRedirect(h, id, model)
            }
          }
          throw Boom.notFound('No form or page found')
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
        path: `/{id}/{path*}`,
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
