import config from "../config";
import pino from "hapi-pino";
export default {
  plugin: pino,
  options: {
    prettyPrint:
      config.logPrettyPrint === "true" || config.logPrettyPrint === true,
    level: config.logLevel,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    debug: config.isDev,
    logRequestStart: config.isDev,
    logRequestComplete: config.isDev,
    ignoreFunc: (_options, request) =>
      request.path.startsWith("/assets") || request.url.contains("assets"),
    redact: {
      paths: config.logRedactPaths,
      censor: "REDACTED",
    },
  },
};
