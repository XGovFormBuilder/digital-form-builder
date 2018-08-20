const glupe = require('glupe')
const { manifest, options } = require('./server')

;(async () => {
  try {
    await glupe(manifest, options)
    if (process.send) {
      process.send('online')
    }
  } catch (err) {
    console.error(err)
  }
})()
