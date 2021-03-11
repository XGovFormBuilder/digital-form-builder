const { Given, When, Then } = require("cucumber");
const { formRunner } = require("../pageobjects/pages");

Given("I am at the beginning of the {string} form", function (formName) {
  let formPath = formName.replace(/ /g, "-").toLowerCase();
  formRunner.open(formPath);
});

Given("I complete the form", function () {
  formRunner.selectRadio("Yes, I do have a link");
  formRunner.multilineText("https://nodejs.org/en/");
  formRunner.selectRadio("No, I don't have evidence");
  formRunner.multilineText("File upload is not yet finished!!");
});

When("I view the Summary page", function () {
  expect(formRunner.pageTitle).toHaveText("summary");
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
  formRunner.multilineText("https://nodejs.org/en/");
});
