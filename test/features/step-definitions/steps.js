const chai = require("chai");
const { Given, When, Then } = require("cucumber");
const addComponentPage = require("../pageobjects/add-component.page");
const ConfigPage = require("../pageobjects/config.page");
const EditPageSection = require("../pageobjects/edit-page.section");
const FormDesignerPage = require("../pageobjects/form-designer.page");
const MenuSection = require("../pageobjects/menu.section");

const pages = {
  start: ConfigPage,
};

Given("I have created a new form configuration", () => {
  pages.start.open();
  const configRef = `smoke-testing ${Date.parse(Date())}`;
  ConfigPage.newConfig(configRef);
  expect(browser).toHaveUrlContaining(configRef.replace(" ", "-"));
});

When("I add a {string} control to the {string}", (componentName, pageName) => {
  this.pageName = pageName;
  FormDesignerPage.createComponentForPageName(pageName).click();
  addComponentPage.selectComponentByName(componentName);
  addComponentPage.completeDateField(
    "Date of Birth",
    "dateOfBirth",
    "Please enter your date of birth using the format dd/mm/yyyy"
  );
});

Then("the Date field control is displayed in the page", () => {
  chai.expect(FormDesignerPage.dropdown(this.pageName).isDisplayed()).to.be
    .true;
  expect(FormDesignerPage.dropdown(this.pageName)).toHaveText("dd/mm/yyyy");
});

When("I edit the page title on the {string}", (pageName) => {
  this.newPageName = "testing";
  FormDesignerPage.editPageForPageName(pageName).click();
  EditPageSection.pageTitle.setValue(this.newPageName);
  EditPageSection.saveBtn.click();
});

Then("the changes are reflected in the page designer", () => {
  FormDesignerPage.designerMenu.waitForDisplayed();
  console.log(FormDesignerPage.getTitleTextForPage(this.newPageName));
  expect(FormDesignerPage.getTitleTextForPage(this.newPageName)).toBe(
    this.newPageName
  );
});

When("I choose {string} from the designer menu", (menuOption) => {
  MenuSection.buttonByName(menuOption).click();
  this.newPageName = "Personal Details";
  EditPageSection.pageTitle.setValue(this.newPageName);
  EditPageSection.saveBtn.click();
});

Then("the page is added in the designer", () => {
  const pageName = this.newPageName.toLowerCase().replace(" ", "-");
  FormDesignerPage.designerMenu.waitForDisplayed();
  expect(FormDesignerPage.getTitleTextForPage(pageName)).toBe(this.newPageName);
});
