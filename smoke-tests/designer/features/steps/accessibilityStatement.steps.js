const { Given, When, Then } = require("@cucumber/cucumber");
const { configPage } = require("../pageobjects/pages");
const actions = require("../actions/actions");

Given("I am on the new configuration page", function () {
  configPage.open();
  expect(configPage.govPhaseBanner).toHaveTextContaining("ALPHA");
  expect(configPage.govPhaseBanner).toHaveTextContaining(
    "This service is currently in development"
  );
});

Then("I can see the footer element at the bottom of the page", function () {
  configPage.verifyFooter();
});

Given("I am on the form designer page", function () {
  actions.createNewConfig();
  expect(configPage.govPhaseBanner).toHaveTextContaining(
    "This service is currently in development"
  );
});

When("I select the {string} in the footer", function (footerLink) {
  configPage.footerLinks(footerLink).click();
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
