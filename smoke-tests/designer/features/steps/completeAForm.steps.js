const { Given, When, Then } = require("cucumber");
const { formRunner } = require("../pageobjects/pages");
const forms = require("../actions/forms");
const { toCamelCase } = require("../../support/testHelpers");
const formData = require("../../data/formData");

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
  formRunner.submitButton.click();
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
  formRunner.inputTextBox("https://nodejs.org/en/");
});

Then(/^the Summary page is displayed with my answers$/, function () {
  browser.waitUntil(
    () => formRunner.pageTitle.getText().toLowerCase() === "summary",
    {
      timeoutMsg: `Failed to reach the Summary page, page url is: ${browser.getUrl()}`,
    }
  );
  expect(formRunner.summaryAnswer(formData.yesNo.question)).toHaveText("Yes");
  expect(formRunner.summaryAnswer(formData.address.question)).toHaveText(
    "Testington Manor, Test Road, Test Town, TT1 1TT"
  );
  expect(formRunner.summaryAnswer(formData.dateField.question)).toHaveText(
    "1 January 2020"
  );
  expect(formRunner.summaryAnswer(formData.checkBox1.question)).toHaveText(
    "1, 2"
  );
  expect(formRunner.summaryAnswer(formData.autoComp.question)).toHaveText(
    "Not supplied"
  );
  expect(formRunner.summaryAnswer(formData.textField.question)).toHaveText(
    "740"
  );
  expect(formRunner.summaryAnswer(formData.dateParts.question)).toHaveText(
    "22 March 2021"
  );
  expect(formRunner.summaryAnswer(formData.radio2.question)).toHaveText(
    "Not supplied"
  );
  expect(formRunner.summaryAnswer(formData.multiLine.question)).toHaveText(
    "I've turned it into a spaceship capable of interstellar travel"
  );
  expect(formRunner.summaryAnswer(formData.textField2.question)).toHaveText(
    "Juan Pablo Montoya"
  );
  expect(formRunner.summaryAnswer(formData.emailAddress.question)).toHaveText(
    "testing@example.com"
  );
});
