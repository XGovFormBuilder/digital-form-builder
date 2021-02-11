import config from "../config";
import pino from "hapi-pino";

export default {
  plugin: pino,
  options: {
    logPayload: config.logPayload,
    prettyPrint: config.isDev,
    level: config.logLevel,
  },
};
