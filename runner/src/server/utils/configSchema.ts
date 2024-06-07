import Joi, { CustomHelpers } from "joi";
import { isUrlSecure } from "server/utils/url";

export function secureUrl(value: string, helper: CustomHelpers) {
  if (isUrlSecure(value)) {
    return value;
  }

  return helper.message({
    custom: `Provided ${helper.state.path} is insecure, please use https`,
  });
}

/**
 * joi schema validation is used here to ensure that there are not invalid key/values when a server is starting up.
 */
export const configSchema = Joi.object({
  port: Joi.number(),
  env: Joi.string().valid("development", "test", "production"),
  logLevel: Joi.string()
    .optional()
    .allow("trace", "debug", "info", "warn", "error"),
  logPrettyPrint: Joi.boolean().optional(),
  logRedactPaths: Joi.array().items(Joi.string()),
  ordnanceSurveyKey: Joi.string().optional(),
  browserRefreshUrl: Joi.string().optional(),
  feedbackLink: Joi.string(),
  phaseTag: Joi.string().optional().valid("", "alpha", "beta"),
  gtmId1: Joi.string().optional(),
  gtmId2: Joi.string().optional(),
  matomoId: Joi.string().optional(),
  matomoUrl: Joi.string().custom(secureUrl).optional(),
  payApiUrl: Joi.string().custom(secureUrl),
  payReturnUrl: Joi.string().custom(secureUrl),
  serviceUrl: Joi.string().optional(),
  vcapServices: Joi.string(),
  redisHost: Joi.string().optional(),
  redisPort: Joi.number().optional(),
  redisPassword: Joi.string().optional(),
  redisTls: Joi.boolean().optional(),
  serviceName: Joi.string().optional(),
  documentUploadApiUrl: Joi.string(),
  previewMode: Joi.boolean().optional(),
  enforceCsrf: Joi.boolean().optional(),
  sslKey: Joi.string().optional(),
  sslCert: Joi.string().optional(),
  sessionTimeout: Joi.number(),
  sessionCookiePassword: Joi.string().optional(),
  rateLimit: Joi.boolean().optional(),
  fromEmailAddress: Joi.string().optional().allow(""),
  serviceStartPage: Joi.string().optional().allow(""),
  privacyPolicyUrl: Joi.string().optional().allow(""),
  contactUsUrl: Joi.string().optional().allow(""),
  cookiePolicyUrl: Joi.string().optional().allow(""),
  accessibilityStatementUrl: Joi.string().optional().allow(""),
  notifyTemplateId: Joi.string().optional().allow(""),
  notifyAPIKey: Joi.string().optional().allow(""),
  lastCommit: Joi.string(),
  lastTag: Joi.string(),
  apiEnv: Joi.string().allow("test", "production", "").optional(),
  authEnabled: Joi.boolean().optional(),
  authClientId: Joi.string().when("authEnabled", {
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  authClientSecret: Joi.string().when("authEnabled", {
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  authClientAuthUrl: Joi.string().when("authEnabled", {
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  authClientTokenUrl: Joi.string().when("authEnabled", {
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  authClientProfileUrl: Joi.string().when("authEnabled", {
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  safelist: Joi.array().items(Joi.string()),
  initialisedSessionTimeout: Joi.number(),
  initialisedSessionKey: Joi.string(),
  savePerPage: Joi.boolean().optional(),
  awsBucketName: Joi.string().optional(),
  awsRegion: Joi.string().optional(),
  jwtAuthCookieName: Joi.string().optional(),
  jwtRedirectToAuthenticationUrl: Joi.string().optional(),
  rsa256PublicKeyBase64: Joi.string().optional(),
  logoutUrl: Joi.string().optional(),
  multifundDashboard: Joi.string(),
  basicAuthOn: Joi.boolean().optional(),
  overwriteInitialisedSession: Joi.boolean().optional(),
  eligibilityResultUrl: Joi.string().optional().allow(""),
});

export function buildConfig(config) {
  // Validate config
  const result = configSchema.validate(config, {
    abortEarly: false,
    convert: true,
    allowUnknown: true,
  });

  // Throw if config is invalid
  if (result.error) {
    throw new Error(`The server config is invalid. ${result.error.message}`);
  }

  return config;
}
