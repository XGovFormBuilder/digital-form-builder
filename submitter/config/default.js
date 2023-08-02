const { deferConfig } = require("config/defer");
const dotEnv = require("dotenv");
if (process.env.NODE_ENV !== "test") {
  dotEnv.config({ path: ".env" });
}

module.exports = {
  env: "development",
  port: "9000",

  /**
   * logging config
   */
  logPrettyPrint: true,
  logLevel: "info",

  /**
   * Helper flags
   */
  isDev: deferConfig(function () {
    return this.env !== "production";
  }),

  /**
   * Queue service config
   */
  queueDatabaseUrl: "",
  queueDatabaseUsername: "",
  queueDatabasePassword: "",
  pollingInterval: "5000",
};
