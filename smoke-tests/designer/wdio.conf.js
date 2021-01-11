const { ReportAggregator, HtmlReporter } = require("@rpii/wdio-html-reporter");

const drivers = {
  chrome: { version: "86.0.4240.22" }, // https://chromedriver.chromium.org/
  firefox: { version: "0.27.0" }, // https://github.com/mozilla/geckodriver/releases
};

exports.config = {
  runner: "local",
  specs: ["./features/**/*.feature"],
  exclude: [],
  maxInstances: 5,
  capabilities: [
    {
      maxInstances: 5,
      browserName: "chrome",
      acceptInsecureCerts: true,
    },
  ],

  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: "info",

  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  baseUrl: "http://localhost:3000",
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
    [
      HtmlReporter,
      {
        debug: true,
        outputDir: "./reports/html-reports/",
        filename: "report.html",
        reportTitle: "Smoke Test Reports",

        //to show the report in a browser when done
        showInBrowser: true,

        //to turn on screenshots after every test
        useOnAfterCommandForScreenshot: false,

        // to use the template override option, can point to your own file in the test project:
        // templateFilename: path.resolve(__dirname, '../template/wdio-html-reporter-alt-template.hbs'),

        // to add custom template functions for your custom template:
        // templateFuncs: {
        //     addOne: (v) => {
        //         return v+1;
        //     },
        // },

        //to initialize the logger
        //LOG: log4j.getLogger("default"),
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

  // =====
  // Hooks
  // =====

  beforeFeature: function () {
    browser.maximizeWindow();
  },
  onPrepare: function (config, capabilities) {
    let reportAggregator = new ReportAggregator({
      outputDir: "./reports/html-reports/",
      filename: "master-report.html",
      reportTitle: "Master Report",
      browserName: capabilities.browserName,
      collapseTests: true,
      // to use the template override option, can point to your own file in the test project:
      // templateFilename: path.resolve(__dirname, '../template/wdio-html-reporter-alt-template.hbs')
    });
    reportAggregator.clean();

    global.reportAggregator = reportAggregator;
  },

  onComplete: function (exitCode, config, capabilities, results) {
    (async () => {
      await global.reportAggregator.createReport();
    })();
  },
};
