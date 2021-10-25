import dotenv from "dotenv";
import joi from "joi";
let AWS = require("aws-sdk");

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
  AWS_ACCESS_KEY_ID: joi.string().when("persistentBackend", {
    is: "s3",
    then: joi.string().required(),
    otherwise: joi.string().optional(),
  }),
  AWS_SECRET_ACCESS_KEY: joi.string().when("persistentBackend", {
    is: "s3",
    then: joi.string().required(),
    otherwise: joi.string().optional(),
  }),
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
};

// Validate config
const result = schema.validate(
  {
    ...config,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  },
  { abortEarly: false }
);

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`);
}

// Use the joi validated value
const value: Config = result.value;

value.isProd = value.env === "production";
value.isDev = !value.isProd;
value.isTest = value.env === "test";

export default value;
