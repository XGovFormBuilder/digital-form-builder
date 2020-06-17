const createServer = require('./server')

createServer()
  .then(server => server.start())
  .then(() => process.send && process.send('online'))
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
