const nanoid = require("nanoid");
const minute = 60 * 1000;
const { deferConfig } = require("config/defer");
const dotEnv = require("dotenv");
if (process.env.NODE_ENV !== "test") {
  dotEnv.config({ path: ".env" });
}

module.exports = {
  /**
   * Initialised sessions
   * Allows a user's state to be pre-populated.
   */
  initialisedSessionTimeout: minute * 60 * 24 * 28, // Defaults to 28 days. Set the TTL for the initialised session in ms.
  initialisedSessionKey: `${nanoid.random(16)}`, // This should be set if you are deploying replicas, otherwise the key will be different per replica
  initialisedSessionAlgorithm: "HS512", // allowed algorithms: "RS256", "RS384", "RS512","PS256", "PS384", "PS512", "ES256", "ES384", "ES512", "EdDSA", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "HS256", "HS384", "HS512"

  /**
   * Server
   */
  port: 3009,
  env: "development",
  previewMode: false,
  enforceCsrf: true,
  sandbox: false,

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
    return this.sandbox === true || this.sandbox === "true";
  }),

  /**
   * Analytics
   */
  // Google Tag Manager - you must amend the privacy notice if you use GTM to load analytics scripts.
  gtmId1: "GTM-MM6VPCXX",
  // gtmId2: "",

  // Matomo (aka Piwik)
  // matomoId: "",
  // matomoUrl: "",

  /**
   * Service
   */
  serviceUrl: "http://localhost:3009", //This is used for redirects back to the runner.
  serviceName: "Webforms",
  serviceStartPage: "/ReportAnOutbreak/start",
  privacyPolicyUrl: "",
  feedbackLink: "#", // Used in your phase banner. Can be a URL or more commonly mailto mailto:feedback@department.gov.uk
  phaseTag: "beta", // Accepts "alpha" |"beta" | ""

  /**
   * Session storage
   * Redis integration is optional, but recommended for production environments.
   */
  sessionTimeout: 20 * minute,
  confirmationSessionTimeout: 20 * minute,
  paymentSessionTimeout: 90 * minute, // GOV.UK Pay sessions are 90 minutes. It is possible a user takes longer than 20 minutes to complete a payment.
  httpsCookieSecureAttribute: true, // Assumed usage of HTTPS. Set to false if you are using HTTP.
  sessionCookiePassword: "${SessionCookies.Password}",
  redisHost: "${Redis.Host}",
  redisPort: 6379,
  redisPassword: "${Redis.Password}", // This should be set if you are deploying replicas - SET AS SECRET
  redisTls: true, //run in TLS mode

  /**
   * SSL
   */
  // sslKey: "", // Path to the SSL key
  // sslCert: "", // Path to the SSL certificate
  rateLimit: true,

  /**
   * Email outputs
   * Email outputs will use notify to send an email to a single inbox. You must configure this for EMAIL outputs.
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
  // payReferenceLength: "10" // The length of the string generated for GOV.UK Pay references.
  // If both the api env and node env are set to "production", the pay return url will need to be secure.
  // This is not the case if either are set to "test", or if the node env is set to "development"
  // payReturnUrl: "http://localhost:3009"
  documentUploadApiUrl: "${KLSUploadAPILink}",
  // ordnanceSurveyKey: "", // deprecated - this API is deprecated
  // browserRefreshUrl: "", // deprecated - idk what this does

  /**
   * Authentication
   * when setting authEnabled to true, you must configure the rest of the auth options.
   * Currently only oAuth is supported.
   */
  authEnabled: false,
  // authClientId: "", // oAuth client ID;
  // authClientSecret: "", // oAuth client Secret
  // authClientAuthUrl: "", // oAuth client secret
  // authClientTokenUrl: "", // oAuth client token endpoint
  // authClientProfileUrl: "" // oAuth client user profile endpoint

  /**
   * Logging
   */
  logLevel: "info", // Accepts "trace" | "debug" | "info" | "warn" |"error"
  logPrettyPrint: true,
  logRedactPaths: ["req.headers['x-forwarded-for']"], // You should check your privacy policy before disabling this. Check https://getpino.io/#/docs/redaction on how to configure redaction paths

  safelist: ["61bca17e-fe74-40e0-9c15-a901ad120eca.mock.pstmn.io"],

  /**
   * Failure queue
   */
  enableQueueService: false,
  // queueType: "" // accepts "MYSQL" | "PGBOSS"
  // queueDatabaseUrl: "mysql://root:root@localhost:3306/queue" | "postgresql://root:root@localhost:5432/queue
  queueServicePollingInterval: "500", // How frequently to check the queue for a reference number
  queueServicePollingTimeout: "2000", // Total time to wait for a reference number

  allowUserTemplates: true,

  /**
   * File size errors
   */

  maxClientFileSize: Math.round(5.2 * 1024 * 1024), // 5452595 bytes
  maxFileSizeStringInMb: "5", // The file size to render if the file is too large in MB
};
