import config from "../config";
import pino from "hapi-pino";

export default {
  plugin: pino,
  options: {
    prettyPrint: config.serviceUrl.includes("localhost"),
    level: config.logLevel,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    logRequestComplete: config.isDev,
    ignorePaths: [
      "/assets/images/favicon.ico",
      "/assets/images/govuk-apple-touch-icon-180x180.png",
      "/assets/fonts/light-94a07e06a1-v2.woff2",
      "/assets/images/govuk-crest.png",
      "/assets/images/govuk-crest-2x.png",
      "/assets/all.js",
      "/assets/upload-dialog.js",
      "/assets/dialog-polyfill.0.4.3.js",
      "/assets/modal-dialog.js",
      "/assets/govuk-template.js",
      "/assets/jquery-3.5.1.min.js",
      "/assets/stylesheets/application.css",
      "/assets/fonts/light-f591b13f7d-v2.woff",
      "/assets/fonts/bold-affa96571d-v2.woff",
      "/assets/accessible-autocomplete.min.js",
      "/assets/fonts/bold-b542beb274-v2.woff2",
    ],
  },
};
