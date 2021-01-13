import Lab from "@hapi/lab";
import { expect } from "@hapi/code";

import { buildConfig } from "server/config";

const { beforeEach, test, suite, afterEach } = (exports.lab = Lab.script());

suite(`Server Config`, () => {
  const processEnv = process.env;
  let customVariables;

  beforeEach(() => {
    customVariables = {
      PORT: 1234,
      NODE_ENV: "test",
      LOG_LEVEL: "TEST_LOG_LEVEL",
      ORDNANCE_SURVEY_KEY: "TEST_ORDNANCE_SURVEY_KEY",
      BROWSER_REFRESH_URL: "TEST_BROWSER_REFRESH_URL",
      FEEDBACK_LINK: "TEST_FEEDBACK_LINK",
      MATOMO_ID: "TEST_MATOMO_ID",
      MATOMO_URL: "https://matomo.url",
      PAY_API_URL: "https://pay.url",
      PAY_RETURN_URL: "https://pay.return.url",
      SERVICE_URL: "TEST_SERVICE_URL",
      REDIS_HOST: "TEST_REDIS_HOST",
      REDIS_PORT: "9999",
      REDIS_PASSWORD: "TEST_REDIS_PASSWORD",
      REDIS_TLS: "true",
      SERVICE_NAME: "TEST_REDIS_TLS",
      DOCUMENT_UPLOAD_API_URL: "TEST_DOCUMENT_UPLOAD_API_URL",
      PREVIEW_MODE: "true",
      SSL_KEY: "TEST_SSL_KEY",
      SSL_CERT: "TEST_SSL_CERT",
      SESSION_TIMEOUT: "9999",
      SESSION_COOKIE_PASSWORD: "TEST_SESSION_COOKIE_PASSWORD",
      RATE_LIMIT: "false",
      FROM_EMAIL_ADDRESS: "TEST_FROM_EMAIL_ADDRESS",
      SERVICE_START_PAGE: "TEST_SERVICE_START_PAGE",
      PRIVACY_POLICY_URL: "TEST_PRIVACY_POLICY_URL",
    };
  });

  afterEach(() => {
    process.env = processEnv;
  });

  test("Environment values are captured", () => {
    process.env = {
      ...process.env,
      ...customVariables,
    };

    const expectedResult = {
      port: 1234,
      env: "test",
      logLevel: "TEST_LOG_LEVEL",
      ordnanceSurveyKey: "TEST_ORDNANCE_SURVEY_KEY",
      browserRefreshUrl: "TEST_BROWSER_REFRESH_URL",
      feedbackLink: "TEST_FEEDBACK_LINK",
      matomoId: "TEST_MATOMO_ID",
      matomoUrl: "https://matomo.url",
      payApiUrl: "https://pay.url",
      payReturnUrl: "https://pay.return.url",
      serviceUrl: "TEST_SERVICE_URL",
      redisHost: "TEST_REDIS_HOST",
      redisPort: 9999,
      redisPassword: "TEST_REDIS_PASSWORD",
      redisTls: true,
      serviceName: "TEST_REDIS_TLS",
      documentUploadApiUrl: "TEST_DOCUMENT_UPLOAD_API_URL",
      previewMode: true,
      sslKey: "TEST_SSL_KEY",
      sslCert: "TEST_SSL_CERT",
      sessionTimeout: 9999,
      sessionCookiePassword: "TEST_SESSION_COOKIE_PASSWORD",
      rateLimit: false,
      fromEmailAddress: "TEST_FROM_EMAIL_ADDRESS",
      serviceStartPage: "TEST_SERVICE_START_PAGE",
      privacyPolicyUrl: "TEST_PRIVACY_POLICY_URL",
      isProd: false,
      isDev: true,
      isTest: true,
      isSandbox: false,
    };

    const result = buildConfig();

    expect(result).to.include(expectedResult);
  });

  test("Missing environment values fall back to defaults", () => {
    process.env = {
      ...process.env,
      ...customVariables,
      PORT: undefined,
      NODE_ENV: undefined,
      LOG_LEVEL: undefined,
      SERVICE_URL: undefined,
      DOCUMENT_UPLOAD_API_URL: undefined,
      SESSION_TIMEOUT: undefined,
    };

    const result = buildConfig();

    expect(result).to.include({
      port: 3009,
      env: "development",
      logLevel: "debug",
      serviceUrl: "http://localhost:3009",
      documentUploadApiUrl: "http://localhost:9000",
      sessionTimeout: 1200000,
    });
  });

  test("it throws when MATOMO_URL is insecure", () => {
    process.env = {
      ...process.env,
      ...customVariables,
      MATOMO_URL: "http://insecure.url",
    };

    expect(() => buildConfig()).to.throw(
      Error,
      "The server config is invalid. Provided matomoUrl is insecure, please use https"
    );
  });

  test("it throws when PAY_API_URL is insecure", () => {
    process.env = {
      ...process.env,
      ...customVariables,
      PAY_API_URL: "http://insecure.url",
    };

    expect(() => buildConfig()).to.throw(
      Error,
      "The server config is invalid. Provided payApiUrl is insecure, please use https"
    );
  });

  test("it throws when PAY_RETURN_URL is insecure", () => {
    process.env = {
      ...process.env,
      ...customVariables,
      PAY_RETURN_URL: "http://insecure.url",
    };

    expect(() => buildConfig()).to.throw(
      Error,
      "The server config is invalid. Provided payReturnUrl is insecure, please use https"
    );
  });

  // TODO
  test("Error is throw when required environment value XXX is missing");
  test("Notify Required environment variables in production");
});
