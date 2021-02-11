const { config } = require("./wdio.conf.js");

(config.baseUrl = "http://localhost:3000"), // TODO:- Change to the url in the CI environment
  (config.maxInstances = 1),
  (config.capabilities = [
    {
      maxInstances: 1, // number instances in parallel
      browserName: "chrome",
      "goog:chromeOptions": {
        args: [
          "--disable-infobars",
          "--window-size=1280,800",
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
