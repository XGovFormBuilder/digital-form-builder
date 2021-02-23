const { When, Then } = require("cucumber");
const formDesigner = require("../pageobjects/pages/formDesigner.page");
const editSection = require("../pageobjects/sections/editSection.section");
const addCondition = require("../pageobjects/sections/addCondition.section");
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
  addCondition.displayName(`Test ${this.operator}`);
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
  addCondition.displayName(`Test ${this.operator}`);
  addCondition.selectCondition(this.operator);
  addCondition.selectOperator("is after");
  addCondition.enterDate("01", "01", "2012");
  addCondition.clickButton("Add");
  addCondition.clickLink("Save");
});
