require('dotenv').config({ path: '/keybase/team/cautionyourblast/fco' })
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
  serviceUrl: joi.string().optional()
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
  serviceUrl: process.env.SERVICE_URL
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

// Add some helper props
value.isDev = value.env === 'development'
value.isProd = value.env === 'production'

module.exports = value
