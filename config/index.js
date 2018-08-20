const Joi = require('joi')
const schema = require('./schema')

// Read the config
const config = require('./server.json')

// Validate config
const result = Joi.validate(config, schema, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

module.exports = result.value
