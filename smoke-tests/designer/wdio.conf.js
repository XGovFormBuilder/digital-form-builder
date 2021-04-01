const { hooks } = require("./support/hooks");
const drivers = {
  chrome: { version: "89.0.4389.23" }, // https://chromedriver.chromium.org/
  firefox: { version: "0.27.0" }, // https://github.com/mozilla/geckodriver/releases
};

exports.config = {
  runner: "local",
  specs: ["./features/**/*.feature"],
  exclude: [],
  maxInstances: 6,
  capabilities: [
    {
      maxInstances: 6,
      browserName: "chrome",
      acceptInsecureCerts: true,
    },
  ],

  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: "error",

  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  baseUrl: "http://localhost:3000/",
  runnerUrl: "http://localhost:3009/",
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 120000,
  //
  // Default request retries count
  connectionRetryCount: 3,
  services: [
    [
      "selenium-standalone",
      {
        installArgs: { drivers },
        args: { drivers },
      },
    ],
  ],
  framework: "cucumber",
  reporters: [
    "spec",
    [
      "cucumberjs-json",
      {
        jsonFolder: "./reports/json/",
        language: "en",
      },
    ],
  ],
  cucumberOpts: {
    require: ["./features/steps/*steps.js"],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    format: ["pretty"],
    snippets: false,
    source: true,
    profile: [],
    strict: false,
    tagExpression: "not @wip",
    timeout: 60000,
    ignoreUndefinedDefinitions: true,
  },
  ...hooks,
};
