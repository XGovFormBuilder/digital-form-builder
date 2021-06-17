const { Given, When, Then } = require("@cucumber/cucumber");
const actions = require("../actions/actions");
const configPage = require("../pageobjects/pages/config.page");
const formDesigner = require("../pageobjects/pages/formDesigner.page");

Given("I am on the form designer start page", function () {
  configPage.open();
  expect(configPage.pageHeading).toHaveText("Design and prototype forms");
});

Given("I have previously created a form", function () {
  this.configRef = actions.createNewConfig();
  formDesigner.clickLink("Create new form");
});

When("I try to create a new form without entering a form name", function () {
  configPage.clickButton("Next");
  configPage.clickButton("Next");
});

When("I enter the name of the form again", function () {
  configPage.clickButton("Next");
  configPage.newName.setValue(this.configRef);
  configPage.clickButton("Next");
});

Then("I am informed there is a problem", function () {
  expect(configPage.errorSummary).toBeDisplayed();
  expect(configPage.errorSummaryHeading).toHaveText("There is a problem");
});

Then("the error message {string} is displayed", function (errorMessage) {
  expect(configPage.errorSummaryErrors(0)).toHaveText(errorMessage);
  expect(configPage.formError).toHaveTextContaining(errorMessage);
  expect(formDesigner.designerMenu).not.toBeDisplayed();
});

Given(/^I have chosen to create a new form$/, function () {
  configPage.newForm.click();
  configPage.nextBtn.click();
});

When(/^I go back to previous page$/, function () {
  configPage.backToPreviousPage.click();
});

Then(/^the start page is displayed$/, function () {
  expect(configPage.pageHeading).toHaveText("Design and prototype forms");
  expect(configPage.newForm).toBeDisplayed();
  expect(configPage.existingForm).toBeDisplayed();
  expect(configPage.nextBtn).toBeDisplayed();
});

Given(/^I chosen to open an existing form$/, function () {
  configPage.existingForm.click();
  configPage.nextBtn.click();
});
