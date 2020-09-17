const routes = [].concat([
  {
    method: 'GET',
    path: '/robots.txt',
    options: {
      handler: {
        file: 'server/public/static/robots.txt'
      }
    }
  },
  {
    method: 'GET',
    path: '/assets/all.js',
    options: {
      handler: {
        file: 'node_modules/govuk-frontend/all.js'
      }
    }
  },
  {
    method: 'GET',
    path: '/assets/{path*}',
    options: {
      handler: {
        directory: {
          path: './dist/assets'
        }
      }
    }
  }
])

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
