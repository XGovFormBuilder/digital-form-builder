const { Given, When, Then } = require("@cucumber/cucumber");
const { formDesigner } = require("../pageobjects/pages");
const {
  addCondition,
  addLink,
  editSection,
} = require("../pageobjects/sections");
const fieldData = require("../../data/componentFieldData");
const { toCamelCase } = require("../../support/testHelpers");

When(/^I choose to "([^"]*)"$/, function (buttonName) {
  formDesigner.clickButton(buttonName);
});

When(/^I add a condition for the "([^"]*)"$/, function (componentName) {
  editSection.clickLink("Add condition");
  const panelWidth = parseInt(
    browser
      .$$(".panel--flyout")[1]
      .getCSSProperty("width")
      .value.match(/\d+/)[0]
  );
  expect(panelWidth).toBeGreaterThanOrEqual(620);
  this.operator = fieldData[toCamelCase(componentName)].title;
  addCondition.inputDisplayName(`Test ${this.operator}`);
  addCondition.selectCondition(this.operator);
  addCondition.selectOperator("is after");
  addCondition.enterDate("01", "01", "2012");
  addCondition.clickButton("Add");
});

Then(/^the condition is created$/, function () {
  expect(addCondition.getCondition().getText().replace(/'/g, "")).toEqual(
    `${this.operator} is after 2012-01-01`
  );
});

Then(/^I can save the condition$/, function () {
  addCondition.clickLink("Save");
  console.log(addCondition.getConditionLink(`Test ${this.operator}`));
  addCondition.getConditionLink(`Test ${this.operator}`).toExist;
});

When(/^I create a condition for the "([^"]*)" field$/, function (
  componentName
) {
  formDesigner.clickButton("Edit Conditions");
  editSection.clickLink("Add condition");
  this.operator = fieldData[toCamelCase(componentName)].title;
  addCondition.inputDisplayName(`Test ${this.operator}`);
  addCondition.selectCondition(this.operator);
  addCondition.selectOperator("is after");
  addCondition.enterDate("01", "01", "2012");
  addCondition.clickButton("Add");
  addCondition.clickLink("Save");
});

Given(/^I have created a condition$/, function () {
  formDesigner.clickButton("Conditions");
  editSection.clickLink("Add condition");
  this.operator = fieldData[toCamelCase(this.componentName)].title;
  addCondition.inputDisplayName(`Test ${this.operator}`);
  addCondition.selectCondition(this.operator);
  addCondition.selectOperator("is");
  addCondition.selectValue("Yes");
  addCondition.clickButton("Add");
  addCondition.clickLink("Save");
  addCondition.clickLink("Close");
});

When(
  /^I add the condition to the link between the pages "([^"]*)", "([^"]*)"$/,
  function (fromPage, toPage) {
    this.fromPage = fromPage;
    this.toPage = toPage;
    formDesigner.pagesLink(this.fromPage, this.toPage).doubleClick();
    addLink.selectACondition(`Test ${this.operator}`);
    addLink.saveBtn.click();
  }
);

Then(/^the condition is added successfully$/, function () {
  expect(
    formDesigner.pagesLink(this.fromPage, this.toPage).nextElement()
  ).toHaveText(`Test ${this.operator}`);
});
