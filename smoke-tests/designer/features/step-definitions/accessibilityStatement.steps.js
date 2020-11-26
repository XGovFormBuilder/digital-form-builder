const { Given, When, Then } = require("cucumber");
const Config = require("../pageobjects/pages/config.page");
const actions = require("../actions/actions");
const formDesigner = require("../pageobjects/pages/formDesigner.page");

Given("I am on the new configuration page", function () {
  Config.open();
});

Then("I can see the footer element at the bottom of the page", function () {
  Config.verifyFooter();
});

Given("I am on the form designer page", function () {
  actions.createNewConfig();
});

When("I scroll down to the end of the page", function () {
  formDesigner.govFooter.scrollIntoView();
  browser.debug();
});

Then("I can see the footer element", function () {
  Config.verifyFooter();
});
