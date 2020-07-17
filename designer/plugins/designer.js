const Schema = require('digital-form-builder-model/src/schema')
const shortid = require('shortid')
const Wreck = require('@hapi/wreck')
const pkg = require('./../package.json')
const config = require('./../config')
const joi = require('joi')

const publish = async function (id, configuration) {
  return Wreck.post(`${config.previewUrl}/publish`, {
    payload: JSON.stringify({ id, configuration })
  })
}

const getPublished = async function (id) {
  const { payload } = await Wreck.get(`${config.previewUrl}/published/${id}`)
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
        path: `/`,
        options: {
          handler: (request, h) => {
            return h.redirect(`/${shortid.generate()}`)
          }
        }
      })

      // DESIGNER
      server.route({
        method: 'get',
        path: `/{id}`,
        options: {
          handler: (request, h) => {
            let { id } = request.params
            return h.view('designer', { id, previewUrl: config.previewUrl })
          }
        }
      })
      server.route({
        method: 'get',
        path: `/{id}/api/id`,
        options: {
          handler: (request, h) => {
            return h.response(shortid.generate()).code(200)
          }
        }
      })

      // GET DATA
      server.route({
        method: 'GET',
        path: `/{id}/api/data`,
        options: {
          handler: async (request, h) => {
            const { id } = request.params
            try {
              const response = await getPublished(id)
              const { values } = response ? JSON.parse(response) : {}
              if (values) {
                return h.response(JSON.stringify(values)).type('application/json')
              }
            } catch (error) {
              // ignore
            }
            return h.response(require('../new-form')).type('application/json')
          }
        }
      })

      // SAVE DATA
      server.route({
        method: 'PUT',
        path: `/{id}/api/data`,
        options: {
          handler: async (request, h) => {
            let { id } = request.params
            try {
              const result = joi.validate(request.payload, Schema, { abortEarly: false })

              if (result.error) {
                console.log(result.error)
                throw new Error('Schema validation failed')
              }
              await publish(id, result.value)
              return h.response({ ok: true }).code(204)
            } catch (err) {
              return h.response({ ok: false, err: 'Write file failed' }).code(401)
            }
          },
          validate: {
            payload: joi.object().required()
          }
        }
      })
    }
  }
}

module.exports = {
  designerPlugin
}
