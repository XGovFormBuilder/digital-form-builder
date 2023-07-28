import pino from "hapi-pino";

export const pluginLogging = {
  plugin: pino,
  options: {
    prettyPrint: true,
    level: "info",
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    debug: true,
    logRequestStart: true,
    logRequestComplete: true,
    ignoreFunc: (_options, request) =>
      request.path.startsWith("/assets") || request.url.contains("assets"),
    redact: {
      paths: ["req.headers['x-forwarded-for']"],
      censor: "REDACTED",
    },
  },
};
