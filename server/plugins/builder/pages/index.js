const EngineBasePage = require('digital-form-builder-engine/page')
const { UploadService } = require('./../../../lib/documentUpload')

class Page extends EngineBasePage {
  constructor (model, pageDef) {
    super(model, pageDef)
    this.uploadService = new UploadService()
  }

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
        parse: true,
        maxBytes: Number.MAX_SAFE_INTEGER,
        failAction: 'ignore'
      },
      ext: {
        onPreHandler: {
          method: async (request, h) => {
            return this.uploadService.handleUploadRequest(request, h)
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
