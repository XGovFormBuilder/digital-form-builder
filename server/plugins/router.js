const routes = [].concat(
  require('../routes/public'),
  // require('../routes/custom'),
  require('../routes/hybrid')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
