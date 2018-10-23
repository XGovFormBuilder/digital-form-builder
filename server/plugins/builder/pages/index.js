const EngineBasePage = require('digital-form-builder-engine/page')

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
      ext: {
        onPostHandler: {
          method: (request, h) => {
            console.log(`POST onPostHandler ${this.path}`)
            return h.continue
          }
        }
      }
    }
  }
}

module.exports = Page
