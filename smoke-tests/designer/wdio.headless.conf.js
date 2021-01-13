const { config } = require("./wdio.conf.js");

(config.baseUrl = "http://localhost:3000"), // TODO:- Change to the url in the CI environment
  (config.capabilities = [
    {
      maxInstances: 5, // number instances in parallel
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
