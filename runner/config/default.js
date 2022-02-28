const nanoid = require("nanoid");
const minute = 60 * 1000;
const { deferConfig } = require("config/defer");
import dotEnv from "dotenv";
if (process.env.NODE_ENV !== "test") {
  dotEnv.config({ path: ".env" });
}

//TODO:- Deprecate in favour of config
function loadOldEnvVariables() {
  console.warn(`
  Environment variables are now loaded in via runner/config/*.js|json instead of using process.env.UPPER_CASED_VAR, 
  which will be deprecated in a future release.Using the new config files will allow you to have better control over
  the environment variables for different environments (eg development vs test vs production).`);
  const config = {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    ordnanceSurveyKey: process.env.ORDNANCE_SURVEY_KEY,
    browserRefreshUrl: process.env.BROWSER_REFRESH_URL,
    feedbackLink: process.env.FEEDBACK_LINK,
    phaseTag: process.env.PHASE_TAG,
    gtmId1: process.env.GTM_ID_1,
    gtmId2: process.env.GTM_ID_2,
    matomoId: process.env.MATOMO_ID,
    matomoUrl: process.env.MATOMO_URL,
    payApiUrl: process.env.PAY_API_URL,
    payReturnUrl: process.env.PAY_RETURN_URL,
    serviceUrl: process.env.SERVICE_URL,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    redisPassword: process.env.REDIS_PASSWORD,
    serviceName: process.env.SERVICE_NAME,
    documentUploadApiUrl: process.env.DOCUMENT_UPLOAD_API_URL,
    sslKey: process.env.SSL_KEY,
    sslCert: process.env.SSL_CERT,
    sessionTimeout: process.env.SESSION_TIMEOUT,
    sessionCookiePassword: process.env.SESSION_COOKIE_PASSWORD,
    fromEmailAddress: process.env.FROM_EMAIL_ADDRESS,
    serviceStartPage: process.env.SERVICE_START_PAGE,
    privacyPolicyUrl: process.env.PRIVACY_POLICY_URL,
    notifyTemplateId: process.env.NOTIFY_TEMPLATE_ID,
    notifyAPIKey: process.env.NOTIFY_API_KEY,
    lastCommit: process.env.LAST_COMMIT || process.env.LAST_COMMIT_GH,
    lastTag: process.env.LAST_TAG || process.env.LAST_TAG_GH,
    apiEnv: process.env.API_ENV,
    authEnabled: process.env.AUTH_ENABLED,
    authClientId: process.env.AUTH_CLIENT_ID,
    authClientSecret: process.env.AUTH_CLIENT_SECRET,
    authClientAuthUrl: process.env.AUTH_CLIENT_AUTH_URL,
    authClientTokenUrl: process.env.AUTH_CLIENT_TOKEN_URL,
    authClientProfileUrl: process.env.AUTH_CLIENT_PROFILE_URL,
  };
  const filteredEntries = Object.entries(config).filter(([_key, value]) =>
    Boolean(value)
  );
  return Object.fromEntries(filteredEntries);
}

module.exports = {
  /**
   * Initialised sessions
   * Allows a user's state to be pre-populated.
   */
  safelist: [], // Array of hostnames you want to accept when using a session callback. eg "gov.uk".
  initialisedSessionTimeout: minute * 60 * 24 * 28, // Defaults to 28 days. Set the TTL for the initialised session
  initialisedSessionKey: `${nanoid.random(16)}`, // This should be set if you are deploying replicas

  /**
   * Server
   */
  port: 3009,
  env: "development",
  logLevel: "trace", //  Accepts "trace" | "debug" | "info" | "warn" |"error"
  previewMode: true,
  sandbox: true,

  /**
   * Helper flags
   */
  isProd: deferConfig(function () {
    return this.env === "production";
  }),
  isDev: deferConfig(function () {
    return this.env !== "production";
  }),
  isTest: deferConfig(function () {
    return this.env === "test";
  }),
  isSandbox: deferConfig(function () {
    return this.sandbox === true;
  }),

  /**
   * Analytics
   */
  // Google Tag Manager - you must amend the privacy notice if you use GTM to load analytics scripts.
  // gtmId1: "",
  // gtmId2: "",

  // Matomo (aka Piwik)
  // matomoId: "",
  // matomoUrl: "",

  /**
   * Service
   */
  serviceUrl: "http://localhost:3009", //This is used for redirects back to the runner.
  serviceName: "Digital Form Builder - Runner",
  serviceStartPage: "",
  privacyPolicyUrl: "",
  feedbackLink: "#", // Used in your phase banner. Can be a URL or more commonly mailto mailto:feedback@department.gov.uk
  phaseTag: "beta", // Accepts "alpha" |"beta" | ""

  /**
   * Session storage
   * Redis integration is optional, but recommended for production environments.
   */
  sessionTimeout: 20 * minute,
  // sessionCookiePassword: "",
  // redisHost: "http://localhost",
  // redisPort: 6379,
  // redisPassword: nanoid.random(16), // This should be set if you are deploying replicas
  // redisTls: true, //run in TLS mode

  /**
   * SSL
   */
  // sslKey: "", // Path to the SSL key
  // sslCert: "", // Path to the SSL certificate
  rateLimit: true,

  /**
   * Email outputs
   * Email outputs will use notify to send an email to a single inbox.
   * Not to be confused with notify outputs which is configured per form.
   */
  notifyTemplateId: "",
  notifyAPIKey: "",
  fromEmailAddress: "",

  /**
   * Health checks
   * These should be configured with environment variables.
   */
  // lastCommit: "undefined",
  // lastTag: "undefined",

  /**
   * API integrations
   */
  // API keys configured within a form may be set like so { "test": "test-key", "production": "prod" }.
  // Control which is used. Accepts "test" | "production" | "".
  apiEnv: "",
  payApiUrl: "https://publicapi.payments.service.gov.uk/v1",
  documentUploadApiUrl: "http://localhost:9000",
  // ordnanceSurveyKey: "", // deprecated - this API is deprecated
  // browserRefreshUrl: "", // deprecated - idk what this does

  /**
   * Authentication
   * when setting authEnabled to true, you must configure the rest of the auth options.
   * Currently only oAuth is supported.
   */
  authEnabled: false,
  // authClientId: "", // oAuth client ID
  // authClientSecret: "", // oAuth client Secret
  // authClientAuthUrl: "", // oAuth client secret
  // authClientTokenUrl: "", // oAuth client token endpoint
  // authClientProfileUrl: "" // oAuth client user profile endpoint
  ...loadOldEnvVariables(),
};
