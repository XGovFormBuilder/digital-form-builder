require('dotenv').config({ path: './../env' })
const joi = require('joi')

// Define config schema
const schema = {
  port: joi.number().default(3000),
  env: joi.string().valid('development', 'test', 'production').default('development'),
  previewUrl: joi.string(),
  persistentBackend: joi.string().valid('s3', 'blob').optional(),
  s3Bucket: joi.string().optional(),
  persistentKeyId: joi.string().optional(),
  persistentAccessKey: joi.string().optional(),
  logLevel: joi.string().valid('trace', 'info', 'debug', 'error').default('debug')
}

// Build config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  previewUrl: process.env.PREVIEW_URL || 'http://localhost:3009',
  persistentBackend: process.env.PERSISTENT_BACKEND,
  persistentKeyId: process.env.PERSISTENT_KEY_ID,
  persistentAccessKey: process.env.PERSISTENT_ACCESS_KEY,
  s3Bucket: process.env.S3_BUCKET,
  logLevel: process.env.LOG_LEVEL || 'debug'
}

// Validate config
const result = joi.validate(config, schema, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the joi validated value
const value = result.value

value.isProd = value.env === 'production'
value.isDev = !value.isProd

module.exports = value
