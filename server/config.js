require('dotenv').config({ path: '.env' })

const joi = require('joi')

// Define config schema
const schema = {
  port: joi.number().default(3009),
  env: joi.string().valid('development', 'test', 'production').default('development'),
  ordnanceSurveyKey: joi.string().optional(),
  browserRefreshUrl: joi.string().optional(),
  matomoId: joi.string().optional(),
  matomoUrl: joi.string().optional(),
  payApiUrl: joi.string(),
  payReturnUrl: joi.string(),
  serviceUrl: joi.string().optional(),
  redisHost: joi.string().optional(),
  redisPort: joi.number().optional(),
  redisPassword: joi.string().optional(),
  redisTls: joi.boolean().optional(),
  serviceName: joi.string().optional(),
  documentUploadApiUrl: joi.string().optional(),
  previewMode: joi.boolean().optional(),
  sslKey: joi.string().optional(),
  sslCert: joi.string().optional(),
  sessionTimeout: joi.number().optional(),
  sessionCookiePassword: joi.string().optional(),
  rateLimit: joi.boolean().optional(),
  fromEmailAddress: joi.string().optional()
}

// Build config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  ordnanceSurveyKey: process.env.ORDNANCE_SURVEY_KEY,
  browserRefreshUrl: process.env.BROWSER_REFRESH_URL,
  matomoId: process.env.MATOMO_ID,
  matomoUrl: process.env.MATOMO_URL,
  payApiUrl: process.env.PAY_API_URL,
  payReturnUrl: process.env.PAY_RETURN_URL,
  serviceUrl: process.env.SERVICE_URL || 'http://localhost:3009',
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  redisTls: process.env.REDIS_TLS === 'true',
  serviceName: process.env.SERVICE_NAME,
  documentUploadApiUrl: process.env.DOCUMENT_UPLOAD_API_URL,
  previewMode: process.env.PREVIEW_MODE || false,
  sslKey: process.env.SSL_KEY,
  sslCert: process.env.SSL_CERT,
  sessionTimeout: process.env.SESSION_TIMEOUT || (20 * 60 * 1000), // default 20 mins
  sessionCookiePassword: process.env.SESSION_COOKIE_PASSWORD,
  rateLimit: process.env.RATE_LIMIT !== 'false',
  fromEmailAddress: process.env.FROM_EMAIL_ADDRESS
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
value.isSandbox = process.env.sandbox || false // for heroku instances
value.isTest = config.env === 'test'

module.exports = value
