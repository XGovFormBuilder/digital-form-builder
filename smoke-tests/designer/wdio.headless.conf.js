const { config } = require("./wdio.conf.js");

(config.maxInstances = 6),
  (config.capabilities = [
    {
      maxInstances: 6, // number instances in parallel
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
