const routes = [].concat(
  require('../routes/public')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)

      server.route({
        method: 'get',
        path: '/help/cookies',
        handler: async (request, h) => {
          return h.view('help/cookies')
        }
      })

      server.route({
        method: 'get',
        path: '/help/terms-and-conditions',
        handler: async (request, h) => {
          return h.view('help/terms-and-conditions')
        }
      })

      server.route({
        method: 'get',
        path: '/clear-session',
        handler: async (request, h) => {
          if (request.yar) {
            request.yar.reset()
          }
          const { redirect } = request.query
          return h.redirect(redirect || '/')
        }
      })

      server.route({
        method: 'get',
        path: '/timeout',
        handler: async (request, h) => {
          if (request.yar) {
            request.yar.reset()
          }

          let startPage = '/'
          const { referer } = request.headers

          if (referer) {
            const match = referer.match(/https?:\/\/[^/]+\/([^/]+).*/)
            if (match && match.length > 1) {
              startPage = `/${match[1]}`
            }
          }

          return h.view('timeout', {
            startPage
          })
        }
      })
    }
  }
}
