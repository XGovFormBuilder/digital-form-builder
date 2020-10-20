import dotEnv from "dotenv";
import Joi from "joi";

dotEnv.config({ path: ".env" });

export type ENV = "development" | "test" | "production";
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";
export interface ConfigSchema {
  port: number;
  env: ENV;
  logLevel?: LogLevel;
  ordnanceSurveyKey?: string;
  browserRefreshUrl?: string;
  feedbackLink?: string;
  matomoId?: string;
  matomoUrl?: string;
  payApiUrl: string;
  payReturnUrl: string;
  serviceUrl?: string;
  redisHost?: string;
  redisPort?: number;
  redisPassword?: string;
  redisTls?: boolean;
  serviceName?: string;
  documentUploadApiUrl?: string;
  previewMode?: boolean;
  sslKey?: string;
  sslCert?: string;
  sessionTimeout?: number;
  sessionCookiePassword?: string;
  rateLimit?: boolean;
  fromEmailAddress?: string;
  serviceStartPage?: string;
  privacyPolicyUrl?: string;
  isProd: boolean;
  isDev: boolean;
  isSandbox: boolean;
  isTest: boolean;
  govUKNotifyDefaultTemplateId?: string;
  govUKNotifyDefaultAPIKey?: string;
}

// Define config schema
const schema = Joi.object({
  port: Joi.number().default(3009),
  env: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  logLevel: Joi.string().optional(),
  ordnanceSurveyKey: Joi.string().optional(),
  browserRefreshUrl: Joi.string().optional(),
  feedbackLink: Joi.string().optional(),
  matomoId: Joi.string().optional(),
  matomoUrl: Joi.string().optional(),
  payApiUrl: Joi.string(),
  payReturnUrl: Joi.string(),
  serviceUrl: Joi.string().optional(),
  redisHost: Joi.string().optional(),
  redisPort: Joi.number().optional(),
  redisPassword: Joi.string().optional(),
  redisTls: Joi.boolean().optional(),
  serviceName: Joi.string().optional(),
  documentUploadApiUrl: Joi.string().optional(),
  previewMode: Joi.boolean().optional(),
  sslKey: Joi.string().optional(),
  sslCert: Joi.string().optional(),
  sessionTimeout: Joi.number().optional(),
  sessionCookiePassword: Joi.string().optional(),
  rateLimit: Joi.boolean().optional(),
  fromEmailAddress: Joi.string().optional(),
  serviceStartPage: Joi.string().optional(),
  privacyPolicyUrl: Joi.string().optional(),
  govUKNotifyDefaultTemplateId: Joi.string()
    .when("env", {
      is: "production",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .label("GOV_UK_NOTIFY_DEFAULT_TEMPLATE_ID"),
  govUKNotifyDefaultAPIKey: Joi.string()
    .when("env", {
      is: "production",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .label("GOV_UK_NOTIFY_DEFAULT_TEMPLATE_ID"),
});

// Build config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL || "debug",
  ordnanceSurveyKey: process.env.ORDNANCE_SURVEY_KEY,
  browserRefreshUrl: process.env.BROWSER_REFRESH_URL,
  feedbackLink: process.env.FEEDBACK_LINK || "#",
  matomoId: process.env.MATOMO_ID,
  matomoUrl: process.env.MATOMO_URL,
  payApiUrl: process.env.PAY_API_URL,
  payReturnUrl: process.env.PAY_RETURN_URL,
  serviceUrl: process.env.SERVICE_URL || "http://localhost:3009",
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  redisTls: process.env.REDIS_TLS === "true",
  serviceName: process.env.SERVICE_NAME,
  documentUploadApiUrl:
    process.env.DOCUMENT_UPLOAD_API_URL || "http://localhost:9000",
  previewMode: process.env.PREVIEW_MODE || false,
  sslKey: process.env.SSL_KEY,
  sslCert: process.env.SSL_CERT,
  sessionTimeout: process.env.SESSION_TIMEOUT || 20 * 60 * 1000, // default 20 mins
  sessionCookiePassword: process.env.SESSION_COOKIE_PASSWORD,
  rateLimit: process.env.RATE_LIMIT !== "false",
  fromEmailAddress: process.env.FROM_EMAIL_ADDRESS,
  serviceStartPage: process.env.SERVICE_START_PAGE,
  privacyPolicyUrl: process.env.PRIVACY_POLICY_URL,
  govUKNotifyDefaultTemplateId: process.env.GOV_UK_NOTIFY_DEFAULT_TEMPLATE_ID,
  govUKNotifyDefaultAPIKey: process.env.GOV_UK_NOTIFY_DEFAULT_API_KEY,
};

// Validate config
const result = schema.validate(config, {
  abortEarly: false,
});

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`);
}

// Use the Joi validated value
const value: ConfigSchema = result.value;

value.isProd = value.env === "production";
value.isDev = !value.isProd;
value.isTest = value.env === "test";
value.isSandbox = String(process.env.sandbox) === "true" ? true : false; // for heroku instances

export default value;
