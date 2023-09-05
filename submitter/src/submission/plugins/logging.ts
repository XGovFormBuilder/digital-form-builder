import pino from "hapi-pino";
import config from "../../config";

export const pluginLogging = {
  plugin: pino,
  options: {
    prettyPrint: config.logPrettyPrint,
    level: config.logLevel,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    debug: config.isDev,
    logRequestStart: config.isDev,
    logRequestComplete: config.isDev,
    redact: {
      paths: ["req.headers['x-forwarded-for']"],
      censor: "REDACTED",
    },
  },
};
