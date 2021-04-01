const chai = require("chai");
const { Given, When, Then } = require("cucumber");
const { formDesigner, previewPage } = require("../pageobjects/pages");
const createComponent = require("../pageobjects/sections/createComponent.section");
const AddLinkSection = require("../pageobjects/sections/addLink.section");
const EditListSection = require("../pageobjects/sections/editLists.section");
const EditPageSection = require("../pageobjects/sections/editPage.section");
const EditSection = require("../pageobjects/sections/editSection.section");
const { navMenu } = require("../pageobjects/sections");
const FieldData = require("../../data/componentFieldData");
const { acceptAlert, toCamelCase } = require("../../support/testHelpers");
const Actions = require("../actions/actions");

Given("I have created a new form configuration", () => {
  Actions.createNewConfig();
});

Given(
  /^I have created a form with a "([^"]*)" field on the "([^"]*)"$/,
  function (componentName, pageName) {
    this.pageName = pageName;
    Actions.createNewConfig();
    Actions.createComponentForPage(componentName, this.pageName);
  }
);

When("I choose to create a component for the {string}", function (pageName) {
  formDesigner.createComponentForPageName(pageName).click();
});

When("I select {string} component to add to the page", function (
  componentName
) {
  this.componentName = componentName;
  createComponent.selectComponentByName(this.componentName);
});

Then(
  "I am able to return to components list with creating the component",
  function () {
    createComponent.backToComponentList.click();
    expect(createComponent.sectionHeading).toHaveText("Create component");
    expect(createComponent.addComponent).toBeDisplayed();
  }
);

Then("the {string} control is displayed in the {string}", function (
  componentName,
  pageName
) {
  this.pageName = pageName;
  const ccCompName = toCamelCase(componentName);
  const componentEl = formDesigner.getComponentOnPage(pageName, ccCompName);
  switch (ccCompName) {
    case "date":
      componentEl.waitForDisplayed();
      expect(componentEl).toHaveText("dd/mm/yyyy");
      break;
    case "dateTime":
      componentEl.waitForDisplayed();
      expect(componentEl).toHaveText("dd/mm/yyyy hh:mm");
      break;
    default:
      componentEl.waitForDisplayed();
      break;
  }
});

When("I add multiple components to the {string}", (pageName) => {
  this.pageComponents = ["Email address", "Date"];
  this.pageComponents.forEach((component) =>
    Actions.createComponentForPage(component, pageName)
  );
});

Then("all the components are displayed in the {string}", (pageName) => {
  browser.pause(500);
  this.pageComponents.forEach(
    (component) =>
      chai.expect(
        formDesigner
          .getComponentOnPage(pageName, toCamelCase(component))
          .isDisplayed()
      ).to.be.true
  );
});

When(
  "I delete the {string} control from the {string}",
  (componentName, pageName) => {
    formDesigner
      .getComponentOnPage(pageName, toCamelCase(componentName))
      .waitForDisplayed();
    formDesigner
      .getComponentOnPage(pageName, toCamelCase(componentName))
      .click();
    createComponent.deleteLink.click();
  }
);

Then(
  "the {string} will not be visible in the {string}",
  (componentName, pageName) => {
    formDesigner
      .getComponentOnPage(pageName, toCamelCase(componentName))
      .waitForDisplayed({ reverse: true });
    chai.expect(
      formDesigner
        .getComponentOnPage(pageName, toCamelCase(componentName))
        .isDisplayed()
    ).to.be.false;
  }
);

When("I enter the details for my page", () => {
  this.newPageName = "Personal Details";
  EditPageSection.pageTitle.setValue(this.newPageName);
  EditPageSection.saveBtn.click();
});

When("I link the {string} to the {string}", (fromPage, toPage) => {
  console.log(fromPage, toPage);
  AddLinkSection.selectFromByName(fromPage);
  AddLinkSection.selectToByName(toPage);
  AddLinkSection.saveBtn.click();
});

Then("a link between them will be displayed", () => {
  expect(formDesigner.linkLine).toExist();
});

When("I add a new section", () => {
  EditSection.addSection.click();
  EditSection.sectionTitle.setValue("MyTestSection");
  EditSection.sectionSaveBtn.click();
  browser.waitUntil(
    () => EditSection.sectionLinks[0].getText() === "MyTestSection",
    {
      timeout: 1000,
      timeoutMsg: "Expected new a section to be added",
      interval: 500,
    }
  );
  expect(EditSection.sectionLinks[0]).toHaveText("MyTestSection");
  EditSection.closeLinks[0].click();
});

Then("the section should be available when I edit the Question page", () => {
  formDesigner.editPageForPageName("First page").click();
  expect(EditPageSection.sectionDropdown).toHaveTextContaining("MyTestSection");
});

When("I add a new Global list named {string}", function (listName) {
  this.listName = listName;
  EditListSection.addNewList.click();
  EditListSection.listTitle.setValue(listName);
  EditListSection.createListItem.click();
  EditListSection.addNewListItem(
    "Add list item",
    "Test Global Lists",
    "two",
    "two"
  );
  EditListSection.saveBtn.click();
  EditListSection.closeLinks[0].click();
});

When(
  "I create a {string} control for the {string}",
  (componentName, pageName) => {
    formDesigner.createComponentForPageName(pageName).click();
    createComponent.selectComponentByName(componentName);
  }
);

When("I add a {string} control for the {string}", function (
  componentName,
  pageName
) {
  this.componentName = componentName;
  this.pageName = pageName;
  formDesigner.createComponentForPageName(pageName).click();
  createComponent.selectComponentByName(this.componentName);
  createComponent.completeCommonFields(
    FieldData[toCamelCase(this.componentName)],
    false
  );
  createComponent.selectList(FieldData.list.title);
  createComponent.saveBtn.click();
});

Then("the list is available in the list options", function () {
  expect(
    createComponent.listOptions.findIndex((el) =>
      el.getText().includes(this.listName)
    )
  ).toBeGreaterThan(-1);
});

When("I choose to duplicate the {string}", (pageName) => {
  formDesigner.editPageForPageName(pageName).click();
  if (EditPageSection.parentElement.isDisplayed() === false) {
    formDesigner.editPageForPageName(pageName).click();
  }
  EditPageSection.duplicateBtn.click();
  EditPageSection.closeLinks[0].click();
});

Then(
  "{int} {string} pages are shown in the designer",
  (numberOfPages, pageName) => {
    expect(formDesigner.retrieveNumberOfPagesMatching(pageName)).toEqual(
      numberOfPages
    );
  }
);

When("I choose to delete the {string}", (pageName) => {
  formDesigner.editPageForPageName(pageName).click();
  EditPageSection.deleteBtn.click();
  acceptAlert();
  EditPageSection.closeLinks[0].click();
});

Then("the {string} is no longer visible in the designer", (pageName) => {
  const pageNames = [];
  formDesigner.formPageTitles.forEach((elem) => {
    pageNames.push(elem.getText());
  });
  expect(formDesigner.formPages.length).toEqual(2);
  chai.expect(pageNames).not.include(pageName);
});

Then("the list is selected in the list dropdown", function () {
  expect(EditListSection.selectListValue).toHaveText(FieldData.list.title);
});

When("I add a {string} control to the {string}", function (
  componentName,
  pageName
) {
  this.pageName = pageName;
  Actions.createComponentForPage(componentName, this.pageName);
});

Then("the Date field control is displayed in the page", () => {
  chai.expect(formDesigner.dropdown(this.pageName).isDisplayed()).to.be.true;
  expect(formDesigner.dropdown(this.pageName)).toHaveText("dd/mm/yyyy");
});

When("I edit the page title on the {string}", (pageName) => {
  this.newPageName = "testing";
  formDesigner.editPageForPageName(pageName).click();
  EditPageSection.pageTitle.setValue(this.newPageName);
  EditPageSection.saveBtn.click();
});

Then("the changes are reflected in the page designer", () => {
  browser.waitUntil(
    () => formDesigner.formPageTitles[0].getText() === "testing"
  );
  expect(formDesigner.getTitleTextForPage(this.newPageName)).toBe(
    this.newPageName
  );
});

When("I choose {string} from the designer menu", (menuOption) => {
  navMenu.buttonByName(menuOption).click();
});

Then("the page is added in the designer", () => {
  browser.waitUntil(() => formDesigner.formPages.length === 4);
  this.pageNames = formDesigner.formPageTitles.map(function (element) {
    return element.getText();
  });
  expect(this.pageNames.includes(this.newPageName)).toEqual(true);
});

Then("the {string} is displayed when I Preview the page", function (component) {
  this.component = toCamelCase(component);
  formDesigner.previewPageForPageName(this.pageName).click();
  browser.switchWindow(`${this.pageName}`);
  expect(previewPage.pageTitle).toHaveText(this.pageName);
  if (component !== "Paragraph") {
    expect(previewPage.hintText(FieldData[this.component].name)).toHaveText(
      FieldData[this.component].hint
    );
    expect(
      previewPage.getComponent(FieldData[this.component].name)
    ).toBeDisplayed();
  } else {
    expect(previewPage.paragraph).toBeDisplayed();
  }
});

When("I navigate away from the designer workspace", () => {
  browser.back();
});

Then("I will see an alert warning me that I am about to leave the page", () => {
  const alert = browser.getAlertText();
  expect(alert).toEqual(
    "Are you sure you want to leave the Designer? If you have unsaved changes they will be lost."
  );
});

When("I choose confirm", () => {
  browser.acceptAlert();
});

Then("I will go back to my previous page", () => {
  expect(browser.getUrl()).not.toContain(Actions.configRef);
});

When("I choose cancel", () => {
  browser.dismissAlert();
});

Then("I will be on the same page", () => {
  expect(browser.getUrl()).toContain(Actions.configRef);
});

When("I preview the {string} page", function (pageName) {
  formDesigner.previewPageForPageName(pageName).click();
  browser.switchWindow(pageName);
  previewPage.pageTitle.waitForDisplayed();
});

When("I can check a checkbox", function () {
  previewPage.checkBoxes[0].click();
  expect(previewPage.checkBoxes[0].isSelected()).toEqual(true);
});

Then("progress to the {string} page", function (pageName) {
  previewPage.clickButton("Continue");
  previewPage.summaryList.waitForDisplayed();
  expect(previewPage.pageTitle).toHaveText(pageName);
});
