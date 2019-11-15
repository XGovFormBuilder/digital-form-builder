const EngineBasePage = require('digital-form-builder-engine/page')
const { uploadDocument, fileStreamsFromPayload, saveFileToTmp } = require('./../../../lib/documentUpload')

class Page extends EngineBasePage {
  get getRouteOptions () {
    return {
      ext: {
        onPostHandler: {
          method: (request, h) => {
            console.log(`GET onPostHandler ${this.path}`)
            return h.continue
          }
        }
      }
    }
  }

  get postRouteOptions () {
    return {
      payload: {
        output: 'stream',
        parse: true
      },
      ext: {
        onPreHandler: {
          method: async (request, h) => {
            let files = fileStreamsFromPayload(request.payload)
            files.forEach(file => {
              if (file[1]._data.length < 1) {
                delete request.payload[file[0]]
              }
            })
            if (!files.length || files.find(file => file[1]._data.length < 1)) {
              return h.continue
            } else {
              let file = files[0]
              let key = file[0]
              let { originalFilenames } = await this.getState(request)
              let previousUpload = originalFilenames[key]
              if (previousUpload && file[1].hapi.filename === '') {
                h.request.payload[key] = previousUpload.location
                return h.continue
              }
              try {
                // TODO:- should be for each(?) or limit to one upload per request..? 🤔
                let saved = await saveFileToTmp(file[1])
                let { error, location } = await uploadDocument(saved)
                if (location) {
                  await this.mergeState(request, { originalFilenames: { [key]: { originalFilename: file[1].hapi.filename, location } } })
                  h.request.payload[key] = location
                }
                if (error) {
                  h.request.pre.errors = [{
                    path: key, href: `#${key}`, name: key, text: 'This file contains a virus'
                  }]
                }
              } catch (e) {
                throw e
              }
              return h.continue
            }
          }
        },
        onPostHandler: {
          method: async (request, h) => {
            return h.continue
          }
        }
      }
    }
  }
}

module.exports = Page
