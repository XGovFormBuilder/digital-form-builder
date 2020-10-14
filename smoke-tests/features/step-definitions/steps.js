const Helpers = require("../../support/testHelpers");
const chai = require("chai");
const { Given, When, Then } = require("cucumber");
const AddComponentPage = require("../pageobjects/add-component.page");
const AddLinkSection = require("../pageobjects/sections/add-link.section");
const ConfigPage = require("../pageobjects/config.page");
const EditListSection = require("../pageobjects/sections/edit-lists.section");
const EditPageSection = require("../pageobjects/sections/edit-page.section");
const EditSection = require("../pageobjects/sections/edit-section.section");
const FormDesignerPage = require("../pageobjects/form-designer.page");
const MenuSection = require("../pageobjects/sections/menu.section");

const FieldData = require("../../data/componentFieldData");
const TestHelpers = require("../../support/testHelpers");

const pages = {
  start: ConfigPage,
};

Given("I have created a new form configuration", () => {
  pages["start"].open();
  const configRef = `smoke-testing ${Date.parse(Date())}`;
  ConfigPage.newConfig(configRef);
  expect(browser).toHaveUrlContaining(configRef.replace(" ", "-"));
});

When("I add a {string} control to the {string}", (componentName, pageName) => {
  this.pageName = pageName;
  FormDesignerPage.createComponentForPageName(pageName).click();
  AddComponentPage.selectComponentByName(componentName);
  const myComponentName = `${Helpers.capitalizeAllWords(componentName).replace(
    / /g,
    ""
  )}`;
  switch (componentName) {
    case "Date field":
      AddComponentPage[`complete${myComponentName}`](
        FieldData[TestHelpers.toCamelCase(componentName)]
      );
      break;
    case "Email address field":
      AddComponentPage[`complete${myComponentName}`](
        FieldData[TestHelpers.toCamelCase(componentName)]
      );
      break;
  }
});

Then("the {string} control is displayed in the page", (componentName) => {
  switch (componentName) {
    case "Date field":
      chai.expect(FormDesignerPage.dropdown(this.pageName).isDisplayed()).to.be
        .true;
      expect(FormDesignerPage.dropdown(this.pageName)).toHaveText("dd/mm/yyyy");
      break;
    case "Email address field":
      chai.expect(FormDesignerPage.emailComponent(this.pageName).isDisplayed())
        .to.be.true;
      console.log("ASSERTION NEEDED HERE!");
      break;
  }
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
});

When("I enter the details for my page", () => {
  this.newPageName = "Personal Details";
  EditPageSection.pageTitle.setValue(this.newPageName);
  EditPageSection.saveBtn.click();
});

Then("the page is added in the designer", () => {
  const pageName = this.newPageName.toLowerCase().replace(" ", "-");
  FormDesignerPage.designerMenu.waitForDisplayed();
  expect(FormDesignerPage.getTitleTextForPage(pageName)).toBe(this.newPageName);
});

When("I link the {string} to the {string}", (fromPage, toPage) => {
  console.log(fromPage, toPage);
  AddLinkSection.selectFromByName(fromPage);
  AddLinkSection.selectToByName(toPage);
  AddLinkSection.saveBtn.click();
});

Then("a link between them will be displayed", () => {
  expect(FormDesignerPage.linkLine).toExist();
});

When("I add a new section", () => {
  EditSection.addSection.click();
  EditSection.pageTitle.setValue("MyTestSection");
  EditSection.saveBtn.click();
  expect(EditSection.sectionLinks[0]).toHaveText("MyTestSection");
  EditSection.closeSection.click();
});

Then("the section should be available when I edit the Question page", () => {
  FormDesignerPage.editPageForPageName("Question page").click();
  expect(EditPageSection.sectionDropdown).toHaveTextContaining("MyTestSection");
});

When("I add a new list", () => {
  EditListSection.addList.click();
  EditListSection.listTitle.setValue("Countries");
  EditListSection.add.click();
  EditListSection.fillOutItems("one", "two", "three");
  EditListSection.closeSection.click();
});

When(
  "I create a {string} control for the {string}",
  (componentName, pageName) => {
    FormDesignerPage.createComponentForPageName(pageName).click();
    AddComponentPage.selectComponentByName(componentName);
    AddComponentPage.fromAList.click();
  }
);

Then("the list is available in the list options", () => {
  expect(AddComponentPage.listOptions).toHaveText("Countries");
});

When("I choose to duplicate the {string}", (pageName) => {
  FormDesignerPage.editPageForPageName(pageName).click();
  EditPageSection.duplicateBtn.click();
  EditPageSection.closeSection.click();
});

Then("{int} {string} pages are shown in the designer", (numberOfPages, pageName) => {
  expect(FormDesignerPage.getNumberInArray(pageName)).toEqual(numberOfPages);
});
