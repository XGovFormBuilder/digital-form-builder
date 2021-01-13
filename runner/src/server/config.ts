import dotEnv from "dotenv";
import Joi, { CustomHelpers } from "joi";

import { isUrlSecure } from "src/server/utils/url";

dotEnv.config({ path: ".env" });

const minute = 60 * 1000;
const DEFAULT_SESSION_TTL = 20 * minute;
const DEFAULT_PORT = 3009;
const DEFAULT_ENVIRONMENT = "development";
const DEFAULT_LOG_LEVEL = "debug";
const DEFAULT_SERVICE_URL = "http://localhost:3009";
const DEFAULT_DOCUMENT_UPLOAD_API_URL = "http://localhost:9000";

function secureUrl(value: string, helper: CustomHelpers) {
  if (isUrlSecure(value)) {
    return value;
  }

  return helper.message({
    custom: `Provided ${helper.state.path} is insecure, please use https`,
  });
}

const schema = Joi.object({
  port: Joi.number().default(DEFAULT_PORT),
  env: Joi.string()
    .valid("development", "test", "production")
    .default(DEFAULT_ENVIRONMENT),
  logLevel: Joi.string().optional().default(DEFAULT_LOG_LEVEL),
  ordnanceSurveyKey: Joi.string().optional(),
  browserRefreshUrl: Joi.string().optional(),
  feedbackLink: Joi.string().default("#"),
  matomoId: Joi.string().optional(),
  matomoUrl: Joi.string().custom(secureUrl).optional(),
  payApiUrl: Joi.string().custom(secureUrl),
  payReturnUrl: Joi.string().custom(secureUrl),
  serviceUrl: Joi.string().optional().default(DEFAULT_SERVICE_URL),
  redisHost: Joi.string().optional(),
  redisPort: Joi.number().optional(),
  redisPassword: Joi.string().optional(),
  redisTls: Joi.boolean().optional(),
  serviceName: Joi.string().optional(),
  documentUploadApiUrl: Joi.string().default(DEFAULT_DOCUMENT_UPLOAD_API_URL),
  previewMode: Joi.boolean().optional(),
  sslKey: Joi.string().optional(),
  sslCert: Joi.string().optional(),
  sessionTimeout: Joi.number().default(DEFAULT_SESSION_TTL),
  sessionCookiePassword: Joi.string().optional(),
  rateLimit: Joi.boolean().optional(),
  fromEmailAddress: Joi.string().optional(),
  serviceStartPage: Joi.string().optional(),
  privacyPolicyUrl: Joi.string().optional(),
  notifyTemplateId: Joi.string()
    .when("env", {
      is: "production",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .label("NOTIFY_TEMPLATE_ID"),
  notifyAPIKey: Joi.string()
    .when("env", {
      is: "production",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .label("NOTIFY_API_KEY"),
});

export function buildConfig() {
  // Build config
  const config = {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    ordnanceSurveyKey: process.env.ORDNANCE_SURVEY_KEY,
    browserRefreshUrl: process.env.BROWSER_REFRESH_URL,
    feedbackLink: process.env.FEEDBACK_LINK,
    matomoId: process.env.MATOMO_ID,
    matomoUrl: process.env.MATOMO_URL,
    payApiUrl: process.env.PAY_API_URL,
    payReturnUrl: process.env.PAY_RETURN_URL,
    serviceUrl: process.env.SERVICE_URL,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    redisPassword: process.env.REDIS_PASSWORD,
    redisTls: process.env.REDIS_TLS === "true",
    serviceName: process.env.SERVICE_NAME,
    documentUploadApiUrl: process.env.DOCUMENT_UPLOAD_API_URL,
    previewMode: process.env.PREVIEW_MODE === "true",
    sslKey: process.env.SSL_KEY,
    sslCert: process.env.SSL_CERT,
    sessionTimeout: process.env.SESSION_TIMEOUT,
    sessionCookiePassword: process.env.SESSION_COOKIE_PASSWORD,
    rateLimit: process.env.RATE_LIMIT !== "false",
    fromEmailAddress: process.env.FROM_EMAIL_ADDRESS,
    serviceStartPage: process.env.SERVICE_START_PAGE,
    privacyPolicyUrl: process.env.PRIVACY_POLICY_URL,
    notifyTemplateId: process.env.NOTIFY_TEMPLATE_ID,
    notifyAPIKey: process.env.NOTIFY_API_KEY,
  };

  // Validate config
  const result = schema.validate(config, {
    abortEarly: false,
    convert: true,
  });

  // Throw if config is invalid
  if (result.error) {
    throw new Error(`The server config is invalid. ${result.error.message}`);
  }

  // Use the Joi validated value
  const value = result.value;

  value.isProd = value.env === "production";
  value.isDev = !value.isProd;
  value.isTest = value.env === "test";
  value.isSandbox = process.env.sandbox || false; // for heroku instances

  return value;
}

const config = buildConfig();

export default config;
