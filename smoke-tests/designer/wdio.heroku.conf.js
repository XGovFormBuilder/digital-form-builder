const { config } = require("./wdio.conf.js");

(config.baseUrl = "https://digital-form-builder-designer.herokuapp.com/"),
  (config.runnerUrl = "https://digital-form-builder-runner.herokuapp.com/"),
  (config.maxInstances = 1),
  (config.capabilities = [
    {
      maxInstances: 1, // number instances in parallel
      browserName: "chrome",
      "goog:chromeOptions": {
        args: [
          "--disable-infobars",
          "--window-size=1444,774",
          "--headless",
          "--no-sandbox",
          "--disable-gpu",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      },
    },
  ]);

config.reporters = [
  "spec",
  [
    "cucumberjs-json",
    {
      jsonFolder: "./reports/json/",
      language: "en",
    },
  ],
];

exports.config = config;
