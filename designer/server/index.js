const hapi = require('@hapi/hapi')
const { viewPlugin } = require('./plugins/view')
const { designerPlugin } = require('./plugins/designer')
const Schmervice = require('schmervice')
const config = require('../config')
const { determinePersistenceService } = require('./lib/persistence')

const serverOptions = () => {
  return {
    port: 3000,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  }
}

async function createServer () {
  const server = hapi.server(serverOptions())
  await server.register(require('@hapi/inert'))
  await server.register(require('./plugins/logging'))
  await server.register(viewPlugin)
  await server.register(Schmervice)
  server.registerService([Schmervice.withName('persistenceService', determinePersistenceService(config.persistentBackend))])
  await server.register(designerPlugin)
  await server.register(require('./plugins/router'))

  return server
}

createServer()
  .then(server => server.start())
  .then(() => process.send && process.send('online'))
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
