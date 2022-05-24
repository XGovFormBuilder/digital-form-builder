import config from "../config";
import pino from "hapi-pino";

export default {
  plugin: pino,
  options: {
    prettyPrint: config.logPrettyPrint,
    level: config.logLevel,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    logRequestComplete: config.isDev,
    ignoreFunc: (_options, request) =>
      request.path.includes("assets") || request.url.includes("assets"),
    redact: {
      paths: config.logRedactPaths,
      censor: "REDACTED",
    },
  },
};
