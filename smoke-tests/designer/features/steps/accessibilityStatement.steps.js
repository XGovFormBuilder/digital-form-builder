const { Given, When, Then } = require("cucumber");
const Config = require("../pageobjects/pages/config.page");
const actions = require("../actions/actions");

Given("I am on the new configuration page", function () {
  Config.open();
  expect(Config.govPhaseBanner).toHaveText(
    "ALPHA This service is currently in development"
  );
});

Then("I can see the footer element at the bottom of the page", function () {
  Config.verifyFooter();
});

Given("I am on the form designer page", function () {
  actions.createNewConfig();
  expect(Config.govPhaseBanner).toHaveText(
    "ALPHA This service is currently in development"
  );
});

When("I select the {string} in the footer", function (footerLink) {
  Config.footerLinks(footerLink).click();
});

Then(
  "I can see a new tab is opened with the {string} information page",
  function (pageTitle) {
    this.pageTitle = pageTitle.toLowerCase().replace(/\s+/g, "-");
    browser.switchWindow(`GOV.UK - ${pageTitle}`);
    expect(browser).toHaveUrlContaining(`/help/${this.pageTitle}`);
    expect(browser.$("h1")).toHaveText(`${pageTitle}`, { ignoreCase: true });
  }
);
