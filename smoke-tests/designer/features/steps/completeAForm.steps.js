const { Given, When, Then } = require("cucumber");
const { formRunner } = require("../pageobjects/pages");

Given(/^I am at the beginning of the report a terrorist form$/, function () {
  browser.url(
    "https://digital-form-builder-runner.herokuapp.com/report-a-terrorist/"
  );
});

Given(/^I complete the form$/, function () {
  formRunner.selectRadio("Yes, I do have a link");
  formRunner.multilineText("https://nodejs.org/en/");
  formRunner.selectRadio("No, I don't have evidence");
  formRunner.multilineText("File upload is not yet finished!!");
});

When(/^I view the Summary page$/, function () {
  expect(formRunner.pageTitle).toHaveText("summary");
});

When(/^I submit the completed form$/, function () {
  formRunner.continueButton.click();
});

Then(/^the "([^"]*)" page is displayed$/, function (message) {
  expect(formRunner.submissionConfirmation).toHaveText(message);
});
