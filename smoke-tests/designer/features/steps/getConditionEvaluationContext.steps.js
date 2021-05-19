const { Given, When, Then } = require("cucumber");
const { formRunner } = require("../pageobjects/pages");
const forms = require("../actions/forms");
const { toCamelCase } = require("../../support/testHelpers");
const formData = require("../../data/formData");

Given(
  "I complete the form as if I have a UK passport until I reach the TestConditions page",
  function () {
    formRunner.selectRadio("Yes");
    formRunner.selectDropdownOption("1");
    formRunner.continueButton.click();
    formRunner.inputField("First name", "Applicant");
    formRunner.inputField("Surname", "Example");
    formRunner.continueButton.click();
    formRunner.inputField(
      "Address line 1",
      "4th Floor, Block C, The Soapworks"
    );
    formRunner.inputField("Address line 2", "Colgate Lane");
    formRunner.inputField("Town or city", "Manchester");
    formRunner.inputField("Postcode", "M5 3LZ");
    formRunner.continueButton.click();
    formRunner.inputField("Phone number", "1234567890");
    formRunner.inputField("Your email address", "developer@example.com");
    formRunner.continueButton.click();
  }
);

Given(
  "I complete the form as if I do not have a UK passport until I reach the TestConditions page",
  function () {
    formRunner.selectRadio("No");
  }
);

Then("the TestConditions page is displayed", function () {
  expect(formRunner.pageTitle).toHaveText("TestConditions");
});

Then("I see a paragraph containing {string}", function (paragraphText) {
  expect(formRunner.paragraph).toHaveText(paragraphText);
});

Then("I do not see a paragraph containing {string}", function (paragraphText) {
  expect(formRunner.paragraph).not.toExist();
});

Then("I go back to the {string} page", function (startPage) {
  while (!formRunner.pageTitle.getText().includes(startPage)) {
    formRunner.backToPreviousPage.click();
  }
  expect(formRunner.pageTitle).toHaveTextContaining(startPage);
});
