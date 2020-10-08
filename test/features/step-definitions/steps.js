const chai = require("chai");
const { Given, When, Then } = require("cucumber");
const addComponentPage = require("../pageobjects/add-component.page");
const ConfigPage = require("../pageobjects/config.page");
const EditPageSection = require("../pageobjects/edit-page.section");
const FormDesignerPage = require("../pageobjects/form-designer.page");

const pages = {
  start: ConfigPage,
};

Given("I have created a new form", () => {
  // browser.maximizeWindow();
  pages["start"].open();
  var dateTimeToInt = Date.parse(Date());
  ConfigPage.newConfig("smoke-testing " + dateTimeToInt);
});

When("I add a {string} control to the page", (componentName) => {
  FormDesignerPage.createComponentForPageName("").click();
  addComponentPage.selectComponentByName(componentName);
  addComponentPage.completeDateField(
    "Date of Birth",
    "dateOfBirth",
    "Please enter your date of birth using the format dd/mm/yyyy"
  );
});

Then("the Date field control is displayed in the page", () => {
  console.log(FormDesignerPage.dropdownComponentForPage("").isDisplayed());
  chai.expect(FormDesignerPage.dropdown.isDisplayed()).to.be.true;
  expect(FormDesignerPage.dropdown).toHaveText("dd/mm/yyyy");
});

When("I edit a page", () => {
  this.newPageName = "testing";
  FormDesignerPage.editPageForPageName("").click();
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
