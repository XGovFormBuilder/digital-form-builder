const { defineConfig } = require("cypress");

module.exports = defineConfig({
  chromeWebSecurity: false,
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    specPattern: "**/*.feature",
    experimentalSessionAndOrigin: true,
  },
  env: {
    /**
     * To override these via CLI, prefix with cypress_
     * e.g: to override `designer_url`, set the env var as `cypress_designer_url`.
     */
    DESIGNER_URL: "http://localhost:3000",
    RUNNER_URL: "http://localhost:3009",
    TAGS: "not @wip",
  },
});
