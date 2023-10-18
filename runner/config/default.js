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
  safelist: [], // Array of hostnames you want to accept when using a session callback. eg "gov.uk".
  initialisedSessionTimeout: minute * 60 * 24 * 28, // Defaults to 28 days. Set the TTL for the initialised session
  initialisedSessionKey: `${nanoid.random(16)}`, // This should be set if you are deploying replicas

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
  // gtmId1: "",
  // gtmId2: "",

  // Matomo (aka Piwik)
  // matomoId: "",
  // matomoUrl: "",

  /**
   * Service
   */
  serviceUrl: "http://localhost:3009", //This is used for redirects back to the runner.
  serviceName: "Webforms",
  serviceStartPage: "",
  privacyPolicyUrl: "",
  feedbackLink: "/updated-feedback-form", //`${location.protocol}//${location.host}/Wju7DJxZ-8/give-feedback-on-this-page`, // Used in your phase banner. Can be a URL or more commonly mailto mailto:feedback@department.gov.uk
  phaseTag: "beta", // Accepts "alpha" |"beta"  | ""

  /**
   * Session storage
   * Redis integration is optional, but recommended for production environments.
   */
  sessionTimeout: 20 * minute,
  confirmationSessionTimeout: 20 * minute,
  paymentSessionTimeout: 90 * minute, // GOV.UK Pay sessions are 90 minutes. It is possible a user takes longer than 20 minutes to complete a payment.
  sessionCookiePassword: "${SessionCookies.Password}",
  // - COMMENT OUT TO TEST WITHOUT REDIS -
  // -----------------------------------------------------
  redisHost: "${Redis.Host}",
  redisPort: 6379,
  redisPassword: "${Redis.Password}", // This should be set if you are deploying replicas - SET AS SECRET
  redisTls: true, //run in TLS mode
  // ------------------------------------------------------
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
  documentUploadApiUrl: "http://localhost:9000",
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
};
