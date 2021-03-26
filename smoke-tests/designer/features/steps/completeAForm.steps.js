const { Given, When, Then } = require("cucumber");
const { formRunner } = require("../pageobjects/pages");
const forms = require("../actions/forms");
const { toCamelCase } = require("../../support/testHelpers");

Given("I am at the start of the {string} form", function (formName) {
  this.formName = formName;
  let formPath = this.formName.replace(/ /g, "-").toLowerCase();
  formRunner.open(formPath);
});

Given("I complete the form", function () {
  forms[toCamelCase(this.formName)]();
});

When("I view the Summary page", function () {
  expect(formRunner.pageTitle).toHaveText("summary", { ignoreCase: true });
});

When("I submit the completed form", function () {
  formRunner.continueButton.click();
});

Then("the {string} page is displayed", function (successMessage) {
  expect(formRunner.submissionConfirmation).toHaveText(successMessage);
});

When("I choose {string}", function (usersChoice) {
  formRunner.selectRadio(usersChoice);
});

Then("I taken directly to the page titled {string}", function (pageTitle) {
  expect(formRunner.pageTitle).toHaveTextContaining(pageTitle);
});

Given("I have progressed to the Do you have any evidence? page", function () {
  formRunner.selectRadio("Yes, I do have a link");
  formRunner.textBox("https://nodejs.org/en/");
});

Then(/^the Summary page is displayed with my answers$/, function () {
  expect(formRunner.pageTitle).toHaveText("summary", { ignoreCase: true });
});
