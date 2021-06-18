const { Given, When, Then } = require("@cucumber/cucumber");
const { formRunner } = require("../pageobjects/pages");

Given(/^I choose "([^"]*)" for "([^"]*)"$/, function (
  usersChoice,
  questionText
) {
  browser.waitUntil(() =>
    formRunner.pageTitle.getText().includes(questionText)
  );
  formRunner.selectRadio(usersChoice);
});

When(/^I progress to the TestConditions page$/, function () {
  formRunner.selectDropdownOption("1");
  formRunner.continueButton.click();
  formRunner.inputField("First name", "Applicant");
  formRunner.inputField("Surname", "Example");
  formRunner.continueButton.click();
  formRunner.inputField("Address line 1", "4th Floor, Block C, The Soapworks");
  formRunner.inputField("Address line 2", "Colgate Lane");
  formRunner.inputField("Town or city", "Manchester");
  formRunner.inputField("Postcode", "M5 3LZ");
  formRunner.continueButton.click();
  formRunner.inputField("Phone number", "1234567890");
  formRunner.inputField("Your email address", "developer@example.com");
  formRunner.continueButton.click();
});

Then(/^the text "([^"]*)" "(is|is not)" displayed$/, function (
  paragraphText,
  textState
) {
  textState === "is"
    ? expect(formRunner.paragraph).toHaveText(paragraphText)
    : expect(formRunner.paragraph).not.toExist();
});

Then(/^the header "([^"]*)" "(is|is not)" displayed$/, function (
  paragraphText,
  textState
) {
  textState === "is"
    ? expect(formRunner.pageTitle).toHaveText(paragraphText)
    : expect(formRunner.pageTitle).not.toExist();
});

Given(/^I see the text "([^"]*)" on the TestConditions page$/, function (
  pageText
) {
  let formPath = "get condition evaluation context"
    .replace(/ /g, "-")
    .toLowerCase();
  formRunner.open(formPath);
  formRunner.selectRadio("Yes");
  formRunner.selectDropdownOption("1");
  formRunner.continueButton.click();
  formRunner.inputField("First name", "Applicant");
  formRunner.inputField("Surname", "Example");
  formRunner.continueButton.click();
  formRunner.inputField("Address line 1", "4th Floor, Block C, The Soapworks");
  formRunner.inputField("Address line 2", "Colgate Lane");
  formRunner.inputField("Town or city", "Manchester");
  formRunner.inputField("Postcode", "M5 3LZ");
  formRunner.continueButton.click();
  formRunner.inputField("Phone number", "1234567890");
  formRunner.inputField("Your email address", "developer@example.com");
  formRunner.continueButton.click();
  browser.waitUntil(() => formRunner.paragraph.getText().includes(pageText));
});

When("I go back to the {string} page", function (startPage) {
  while (!formRunner.pageTitle.getText().includes(startPage)) {
    console.log("Page Heading is: " + formRunner.pageTitle.getText());
    formRunner.backToPreviousPage.waitForDisplayed();
    formRunner.backToPreviousPage.click();
  }
  expect(formRunner.pageTitle).toHaveTextContaining(startPage);
});
