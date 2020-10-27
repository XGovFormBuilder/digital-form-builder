const { Given, When, Then } = require("cucumber");
const AddPageSection = require("../pageobjects/sections/add-page.section");
const ConfigPage = require("../pageobjects/pages/config.page");
const FormDesignerPage = require("../pageobjects/pages/form-designer.page");
const MenuSection = require("../pageobjects/sections/menu.section");

Given("I have chosen to {string} to my form", (menuOption) => {
  ConfigPage.open();
  const configRef = `smoke-testing ${Date.parse(Date())}`;
  ConfigPage.newConfig(configRef);
  expect(browser).toHaveUrlContaining(configRef.replace(" ", "-"));
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
  expect(FormDesignerPage.getTitleTextForPage(this.pageName)).toBe(this.newPageName);
  expect(FormDesignerPage.linkLine).toExist();
});
