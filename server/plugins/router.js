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
    }
  }
}
