const dotEnv = require("dotenv");
if (process.env.NODE_ENV !== "test") {
  dotEnv.config({ path: ".env" });
}

module.exports = {
  retentionPeriod: "365",
};
