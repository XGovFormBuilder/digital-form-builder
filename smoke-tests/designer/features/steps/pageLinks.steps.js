const { Given, When, Then } = require("@cucumber/cucumber");
const { formDesigner } = require("../pageobjects/pages");
const {
  addCondition,
  addLink,
  addPage,
  navMenu,
} = require("../pageobjects/sections");
const actions = require("../actions/actions");
const { acceptAlert } = require("../../support/testHelpers");

Given("I have chosen to {string} to my form", (menuOption) => {
  actions.createNewConfig();
  navMenu.buttonByName(menuOption).click();
});

When("I link this page to link from the {string}", (linkedPage) => {
  this.newPageName = "Third page";
  addPage.linkFrom(linkedPage);
  addPage.pageTitle.setValue(this.newPageName);
  addPage.saveBtn.click();
});

Then("my page is created with a link to the page", () => {
  browser.waitUntil(() => formDesigner.pageHeadingsText.length === 4);
  expect(formDesigner.pageHeadingsText.includes("Third page")).toEqual(true);
  expect(formDesigner.linkLine).toExist();
});

When("I delete the link between the pages {string}, {string}", function (
  fromPage,
  toPage
) {
  this.fromPage = fromPage;
  this.toPage = toPage;
  formDesigner.pagesLink(this.fromPage, this.toPage).doubleClick();
  addLink.deleteBtn.click();
  acceptAlert();
});

Then("the link is no longer displayed", function () {
  expect(formDesigner.pagesLink(this.fromPage, this.toPage)).not.toExist();
});

When(/^I select the link between the pages "([^"]*)", "([^"]*)"$/, function (
  fromPage,
  toPage
) {
  formDesigner.pagesLink(fromPage, toPage).doubleClick();
});

Then(/^the "([^"]*)" panel is displayed$/, function (panelName) {
  expect(addLink.sectionTitles[0]).toHaveText(panelName);
});

When(/^I choose to "([^"]*)" from the Edit link panel$/, function (linkName) {
  addLink.clickLink(linkName);
});

Then(/^the Define condition panel is displayed$/, function () {
  expect(addCondition.displayName).toBeDisplayed();
  expect(addCondition.conditionField).toBeDisplayed();
});
