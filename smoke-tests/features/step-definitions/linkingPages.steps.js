const { Given, When, Then } = require("cucumber");
const AddLinkSection = require("../pageobjects/sections/add-link.section");
const AddPageSection = require("../pageobjects/sections/add-page.section");
const FormDesignerPage = require("../pageobjects/pages/form-designer.page");
const MenuSection = require("../pageobjects/sections/menu.section");
const Actions = require("../actions/actions");
const { acceptAlert, toUrl } = require("../../support/testHelpers");

Given("I have chosen to {string} to my form", (menuOption) => {
  Actions.createNewConfig();
  MenuSection.buttonByName(menuOption).click();
});

When("I link ths page to link from the {string}", (linkedPage) => {
  this.newPageName = "Second page";
  AddPageSection.linkFrom(linkedPage);
  AddPageSection.pageTitle.setValue(this.newPageName);
  AddPageSection.saveBtn.click();
});

Then("my page is created with a link to the page", () => {
  this.pageName = this.newPageName.toLowerCase().replace(" ", "-");
  FormDesignerPage.designerMenu.waitForDisplayed();
  expect(FormDesignerPage.getTitleTextForPage(this.pageName)).toBe(
    this.newPageName
  );
  expect(FormDesignerPage.linkLine).toExist();
});

Given("I have linked the {string} to the the {string}", (fromPage, toPage) => {
  this.fromPage = fromPage;
  this.toPage = toPage;
  Actions.createNewConfig();
  MenuSection.buttonByName("Add Link").click();
  AddLinkSection.linkPages(this.fromPage, this.toPage);
});

When("I delete the link between the pages", () => {
  FormDesignerPage.pagesLink.click();
  // TODO:- Get an attribute for selected added to CSS
  // expect(AddLinkSection.fromSelectList).toHaveText(this.fromPage);
  // expect(AddLinkSection.toSelectList).toHaveText(this.toPage);
  AddLinkSection.deleteBtn.click();
  acceptAlert();
});

Then("the link is no longer displayed", () => {
  expect(FormDesignerPage.linkLine).not.toExist();
});
