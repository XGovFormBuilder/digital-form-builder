import dotenv from "dotenv";
import joi from "joi";

dotenv.config({ path: "../.env" });

export interface Config {
  env: "development" | "test" | "production";
  port: number;
  previewUrl: string;
  publishUrl: string;
  persistentBackend: "s3" | "blob" | "preview";
  s3Bucket?: string;
  persistentKeyId?: string;
  persistentAccessKey?: string;
  logLevel: "trace" | "info" | "debug" | "error";
  phase?: "alpha" | "beta";
  footerText?: string;
  isProd: boolean;
  isDev: boolean;
  isTest: boolean;
  lastCommit: string;
  lastTag: string;
  featureDuplicatePage: boolean;
}

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
  persistentKeyId: joi.string().optional(),
  persistentAccessKey: joi.string().optional(),
  logLevel: joi
    .string()
    .valid("trace", "info", "debug", "error")
    .default("debug"),
  phase: joi.string().valid("alpha", "beta").optional(),
  footerText: joi.string().optional(),
  lastCommit: joi.string(),
  lastTag: joi.string(),
  featureDuplicatePage: joi.optional(),
});

// Build config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  previewUrl: process.env.PREVIEW_URL || "http://localhost:3009",
  publishUrl: process.env.PUBLISH_URL || "http://localhost:3009",
  persistentBackend: process.env.PERSISTENT_BACKEND || "preview",
  persistentKeyId: process.env.PERSISTENT_KEY_ID,
  persistentAccessKey: process.env.PERSISTENT_ACCESS_KEY,
  s3Bucket: process.env.S3_BUCKET,
  logLevel: process.env.LOG_LEVEL || "error",
  phase: process.env.PHASE || "alpha",
  footerText: process.env.FOOTER_TEXT,
  lastCommit: process.env.LAST_COMMIT,
  lastTag: process.env.LAST_TAG,
  featureDuplicatePage: true,
};

// Validate config
const result = schema.validate(config, { abortEarly: false });

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
