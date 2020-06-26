import { Page as EngineBasePage } from 'digital-form-builder-engine'

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
        parse: true,
        maxBytes: Number.MAX_SAFE_INTEGER,
        failAction: 'ignore'
      },
      ext: {
        onPreHandler: {
          method: async (request, h) => {
            const { uploadService } = request.services([])
            return uploadService.handleUploadRequest(request, h)
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
