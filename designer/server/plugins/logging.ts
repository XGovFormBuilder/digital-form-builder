import config from "../config";
import pino from "hapi-pino";

export default {
  plugin: pino,
  options: {
    prettyPrint: config.isDev,
    level: config.logLevel,
    logEvents: ["onPostStart", "onPostStop", "request-error"],
  },
};
