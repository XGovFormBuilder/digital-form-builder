const { config } = require("./wdio.conf.js");

(config.maxInstances = 5),
  (config.capabilities = [
    {
      maxInstances: 5,
      browserName: "chrome",
    },
  ]);

config.cucumberOpts = {
  require: ["./features/steps/*steps.js"],
  tagExpression: "@debug",
  timeout: 600000, // timeout for steps in milliseconds
};

exports.config = config;
