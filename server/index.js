const hapi = require('hapi')
const config = require('./config')
const fs = require('fs')
const { pay } = require('./plugins/pay')

const serverOptions = (isDev) => {
  const defaultOptions = {
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  }
  return isDev ? { ...defaultOptions,
    tls: {
      key: fs.readFileSync('/keybase/team/cautionyourblast/fco/localhost-key.pem'),
      cert: fs.readFileSync('/keybase/team/cautionyourblast/fco/localhost.pem')
    } } : defaultOptions
}

async function createServer () {
  const server = hapi.server(serverOptions(config.isDev))
  await server.register(require('inert'))
  await server.register(require('./plugins/locale'))
  await server.register(require('./plugins/session'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/builder'))
  await server.register(pay)
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))

  await server.register(require('blipp'))
  await server.register(require('./plugins/logging'))

  return server
}

module.exports = createServer
