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
  expect($$(".panel--flyout")[1].getCSSProperty("width").value).toEqual(
    "720px"
  );
  this.operator = fieldData[toCamelCase(componentName)].title;
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
