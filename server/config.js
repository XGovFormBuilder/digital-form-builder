require('dotenv').config({ path: '/keybase/team/cautionyourblast/fco/.env' })
const joi = require('joi')

// Define config schema
const schema = {
  port: joi.number().default(3009),
  env: joi.string().valid('development', 'test', 'production').default('development'),
  ordnanceSurveyKey: joi.string().optional(),
  browserRefreshUrl: joi.string().optional(),
  matomoId: joi.string().optional(),
  payApiUrl: joi.string(),
  payApiKey: joi.string(),
  payReturnUrl: joi.string(),
  serviceUrl: joi.string().optional(),
  redisHost: joi.string().optional(),
  redisPort: joi.number().optional(),
  redisPassword: joi.string().optional(),
  serviceName: joi.string().optional()
}

// Build config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  ordnanceSurveyKey: process.env.ORDNANCE_SURVEY_KEY,
  browserRefreshUrl: process.env.BROWSER_REFRESH_URL,
  matomoId: process.env.MATOMO_ID || '0',
  payApiKey: process.env.PAY_API_KEY,
  payApiUrl: process.env.PAY_API_URL,
  payReturnUrl: process.env.PAY_RETURN_URL,
  serviceUrl: process.env.SERVICE_URL || 'http://localhost:3009',
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  serviceName: process.env.SERVICE_NAME
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
