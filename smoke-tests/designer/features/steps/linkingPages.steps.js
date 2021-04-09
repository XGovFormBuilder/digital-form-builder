const { Given, When, Then } = require("cucumber");
const { formDesigner } = require("../pageobjects/pages");
const AddLinkSection = require("../pageobjects/sections/addLink.section");
const AddPageSection = require("../pageobjects/sections/addPage.section");
const { navMenu } = require("../pageobjects/sections");
const Actions = require("../actions/actions");
const { acceptAlert, toUrl } = require("../../support/testHelpers");

Given("I have chosen to {string} to my form", (menuOption) => {
  Actions.createNewConfig();
  navMenu.buttonByName(menuOption).click();
});

When("I link ths page to link from the {string}", (linkedPage) => {
  this.newPageName = "Third page";
  AddPageSection.linkFrom(linkedPage);
  AddPageSection.pageTitle.setValue(this.newPageName);
  AddPageSection.saveBtn.click();
});

Then("my page is created with a link to the page", () => {
  browser.waitUntil(() => formDesigner.formPageTitles.length === 4);
  this.pageNames = formDesigner.formPageTitles.map(function (element) {
    return element.getText();
  });
  expect(this.pageNames.includes("Third page")).toEqual(true);
  expect(formDesigner.linkLine).toExist();
});

When("I delete the link between the pages {string}, {string}", function (
  fromPage,
  toPage
) {
  this.fromPage = fromPage;
  this.toPage = toPage;
  formDesigner.pagesLink(this.fromPage, this.toPage).doubleClick();
  AddLinkSection.deleteBtn.click();
  acceptAlert();
});

Then("the link is no longer displayed", function () {
  expect(formDesigner.pagesLink(this.fromPage, this.toPage)).not.toExist();
});
