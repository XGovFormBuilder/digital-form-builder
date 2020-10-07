const { Schema } = require('@xgovformbuilder/model')
const { nanoid } = require('nanoid')
const Wreck = require('@hapi/wreck')
const pkg = require('../../package.json')
const config = require('../../config')

const publish = async function (id, configuration) {
  try {
    const result = Wreck.post(`${config.publishUrl}/publish`, {
      payload: JSON.stringify({ id, configuration })
    })
    return result
  } catch (error) {
    throw new Error(`Error when publishing to endpoint ${config.publishUrl}/publish: message: ${error.message}`)
  }
}

const getPublished = async function (id) {
  const { payload } = await Wreck.get(`${config.publishUrl}/published/${id}`)
  return payload.toString()
}

const designerPlugin = {
  plugin: {
    name: pkg.name,
    version: pkg.version,
    multiple: true,
    dependencies: 'vision',
    register: (server) => {
      server.route({
        method: 'get',
        path: '/',
        options: {
          handler: async (request, h) => {
            return h.redirect('/new')
          }
        }
      })

      server.route({
        method: 'get',
        path: '/new',
        options: {
          handler: async (request, h) => {
            const { persistenceService } = request.services([])
            let configurations = []
            let error
            try {
              configurations = await persistenceService.listAllConfigurations()
              return h.view('designer', { newConfig: true, configurations })
            } catch (e) {
              error = e
              configurations = []
              return h.view('designer', { newConfig: true, configurations, error })
            }
          }
        }
      })

      server.route({
        method: 'post',
        path: '/new',
        options: {
          handler: async (request, h) => {
            const { persistenceService } = request.services([])
            const { selected, name } = request.payload
            const newName = name === '' ? nanoid(10) : name
            try {
              if (selected.Key === 'New') {
                await persistenceService.uploadConfiguration(`${newName}.json`, JSON.stringify(require('../../new-form.json')))
                await publish(newName, require('../../new-form.json'))
              } else {
                await persistenceService.copyConfiguration(`${selected.Key}`, newName)
                const copied = await persistenceService.getConfiguration(newName)
                await publish(newName, copied)
              }
            } catch (e) {
              console.log(e)
            }

            return h.redirect(`/${newName}`)
          }
        }
      })

      // DESIGNER
      server.route({
        method: 'get',
        path: '/{id}',
        options: {
          handler: (request, h) => {
            const { id } = request.params
            return h.view('designer', { id, previewUrl: config.previewUrl })
          }
        }
      })

      // GET DATA
      server.route({
        method: 'GET',
        path: '/{id}/api/data',
        options: {
          handler: async (request, h) => {
            const { id } = request.params
            try {
              const response = await getPublished(id)
              const { values } = response ? JSON.parse(response) : {}
              if (values) {
                return h.response(JSON.stringify(values))
                  .type('application/json')
              }
            } catch (error) {
              // ignore
            }
            return h.response(require('../../new-form.json'))
              .type('application/json')
          }
        }
      })

      server.route({
        method: 'GET',
        path: '/configurations',
        options: {
          handler: async (request, h) => {
            const { persistenceService } = request.services([])
            try {
              const response = await persistenceService.listAllConfigurations()
              return h.response(response).type('application/json')
            } catch (error) {
              request.server.log(['error', '/configurations'], error)
            }
          }
        }
      })

      // SAVE DATA
      server.route({
        method: 'PUT',
        path: '/{id}/api/data',
        options: {
          handler: async (request, h) => {
            const { id } = request.params
            const { persistenceService } = request.services([])

            try {
              const result = Schema.validate(request.payload, { abortEarly: false })

              if (result.error) {
                throw new Error('Schema validation failed')
              }
              await persistenceService.uploadConfiguration(`${id}`, JSON.stringify(result.value))
              await publish(id, result.value)
              return h.response({ ok: true }).code(204)
            } catch (err) {
              console.log('Designer Server PUT /{id}/api/data error:', err)
              return h.response({ ok: false, err: 'Write file failed' })
                .code(401)
            }
          }
        }
      })
    }
  }
}

module.exports = {
  designerPlugin
}
