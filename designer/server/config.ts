import dotenv from "dotenv";
import joi from "joi";
import { CredentialsOptions } from "aws-sdk/lib/credentials";
import * as AWS from "aws-sdk";

dotenv.config({ path: ".env" });

export interface Config {
  env: "development" | "test" | "production";
  port: number;
  previewUrl: string;
  publishUrl: string;
  persistentBackend: "s3" | "blob" | "preview";
  s3Bucket?: string;
  logLevel: "trace" | "info" | "debug" | "error";
  phase?: "alpha" | "beta";
  footerText?: string;
  isProd: boolean;
  isDev: boolean;
  isTest: boolean;
  lastCommit: string;
  lastTag: string;
  sessionTimeout: number;
  sessionCookiePassword: string;
  httpsCookieSecureAttribute: boolean;
  awsCredentials?: CredentialsOptions;
}

// server-side storage expiration - defaults to 20 minutes
const sessionSTimeoutInMilliseconds = 20 * 60 * 1000;

// Define config schema
const schema = joi.object({
  port: joi.number().default(3000),
  env: joi
    .string()
    .valid("development", "test", "production")
    .default("development"),
  previewUrl: joi.string(),
  publishUrl: joi.string(),
  persistentBackend: joi.string().valid("s3", "blob", "preview").optional(),
  s3Bucket: joi.string().optional(),
  logLevel: joi
    .string()
    .valid("trace", "info", "debug", "error")
    .default("debug"),
  phase: joi.string().valid("alpha", "beta").optional(),
  footerText: joi.string().optional(),
  lastCommit: joi.string().default("undefined"),
  lastTag: joi.string().default("undefined"),
  sessionTimeout: joi.number().default(sessionSTimeoutInMilliseconds),
  sessionCookiePassword: joi.string().optional(),
  httpsCookieSecureAttribute: joi.boolean().optional(),
});

// Build config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  previewUrl: process.env.PREVIEW_URL || "http://localhost:3009",
  publishUrl: process.env.PUBLISH_URL || "http://localhost:3009",
  persistentBackend: process.env.PERSISTENT_BACKEND || "preview",
  s3Bucket: process.env.S3_BUCKET,
  logLevel: process.env.LOG_LEVEL || "error",
  phase: process.env.PHASE || "alpha",
  footerText: process.env.FOOTER_TEXT,
  lastCommit: process.env.LAST_COMMIT || process.env.LAST_COMMIT_GH,
  lastTag: process.env.LAST_TAG || process.env.LAST_TAG_GH,
  sessionTimeout: process.env.SESSION_TIMEOUT,
  sessionCookiePassword: process.env.SESSION_COOKIE_PASSWORD,
  httpsCookieSecureAttribute: process.env.HTTPS_COOKIE_SECURE_ATTRIBUTE,
};

// Validate config
const result = schema.validate(
  {
    ...config,
  },
  { abortEarly: false }
);

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`);
}

// Use the joi validated value
const value: Config = result.value;

/**
 * TODO:- replace this with a top-level await when upgraded to node 16
 */
async function getAwsConfigCredentials(): Promise<CredentialsOptions | {}> {
  return new Promise(function (resolve, reject) {
    if (value.persistentBackend === "s3") {
      return AWS.config.getCredentials(async function (err) {
        if (err) {
          console.error("Error getting AWS credentials", err);
          reject(err);
        } else {
          resolve({
            accessKeyId: AWS.config.credentials.accessKeyId,
            secretAccessKey: AWS.config.credentials.secretAccessKey,
          });
        }
      });
    } else {
      resolve({});
    }
  });
}

getAwsConfigCredentials()
  .then((awsConfig) => {
    value.awsCredentials = awsConfig;
  })
  .catch((e) => {
    throw e;
  });

value.isProd = value.env === "production";
value.isDev = !value.isProd;
value.isTest = value.env === "test";

export default value;
