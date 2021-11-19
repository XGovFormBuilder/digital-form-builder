import { Given, Then, When } from "@cucumber/cucumber";
import { ConfigPage } from "../pageobjects/pages";
import actions from "../actions/actions";

Given("I am on the new configuration page", function () {
  ConfigPage.open();
  expect(ConfigPage.govPhaseBanner).toHaveTextContaining("ALPHA");
  expect(ConfigPage.govPhaseBanner).toHaveTextContaining(
    "This service is currently in development"
  );
});

Then("I can see the footer element at the bottom of the page", function () {
  ConfigPage.verifyFooter();
});

Given("I am on the form designer page", function () {
  actions.createNewConfig();
  expect(ConfigPage.govPhaseBanner).toHaveTextContaining(
    "This service is currently in development"
  );
});

When("I select the {string} in the footer", function (footerLink) {
  ConfigPage.footerLinks(footerLink).click();
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
