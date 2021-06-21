const chai = require("chai");
const { Given, When, Then } = require("@cucumber/cucumber");
const {
  formDesigner,
  formRunner,
  previewPage,
} = require("../pageobjects/pages");
const {
  addLink,
  createComponent,
  editLists,
  editPage,
  editSection,
  navMenu,
} = require("../pageobjects/sections");
const fieldData = require("../../data/componentFieldData");
const { acceptAlert, toCamelCase } = require("../../support/testHelpers");
const Actions = require("../actions/actions");
const testActions = require("../actions/actions");

Given("I have created a new form configuration", () => {
  Actions.createNewConfig();
});

Given(
  /^I have (?:created a|a) form with a "([^"]*)" field on the "([^"]*)"$/,
  function (componentName, pageName) {
    this.componentName = componentName;
    this.pageName = pageName;
    Actions.createNewConfig();
    Actions.createComponentForPage(componentName, this.pageName);
  }
);

When("I choose to create a component for the {string}", function (pageName) {
  formDesigner.createComponent(pageName).click();
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
    browser.waitUntil(
      () =>
        formDesigner
          .getComponentOnPage(pageName, toCamelCase(componentName))
          .isDisplayed() === false
    );
  }
);

Then(
  "the {string} will not be visible in the {string}",
  (componentName, pageName) => {
    chai.expect(
      formDesigner
        .getComponentOnPage(pageName, toCamelCase(componentName))
        .isDisplayed()
    ).to.be.false;
  }
);

When("I enter the details for my page", () => {
  this.newPageName = "Personal Details";
  editPage.pageTitle.setValue(this.newPageName);
  editPage.saveBtn.click();
});

When("I link the {string} to the {string}", (fromPage, toPage) => {
  addLink.selectFromByName(fromPage);
  addLink.selectToByName(toPage);
  addLink.saveBtn.click();
});

Then("a link between them will be displayed", () => {
  expect(formDesigner.linkLine).toExist();
});

When("I add a new section titled {string}", function (sectionTitle) {
  this.sectionTitle = sectionTitle;
  editSection.addSection.click();
  editSection.sectionTitle.setValue(sectionTitle);
  editSection.saveBtn.click();
  browser.waitUntil(
    () => editSection.sectionLinks[0].getText() === this.sectionTitle,
    {
      timeout: 1000,
      timeoutMsg: `Expected new a section title ${this.sectionTitle} to be added`,
      interval: 500,
    }
  );
  expect(editSection.sectionLinks[0]).toHaveText(this.sectionTitle);
  editSection.closeLinks[0].click();
});

Then(
  "the section should be available when I edit the Question page",
  function () {
    expect(editPage.sectionDropdown).toHaveText(this.sectionTitle);
  }
);

When("I add a new Global list named {string}", function (listName) {
  this.listName = listName;
  editLists.addNewList.click();
  editLists.listTitle.setValue(listName);
  editLists.createListItem.click();
  editLists.addNewListItem("Add list item", "Test Global Lists", "two", "two");
  editLists.saveBtn.click();
  editLists.closeLinks[0].click();
});

When(
  "I create a {string} control for the {string}",
  (componentName, pageName) => {
    formDesigner.createComponent(pageName).click();
    createComponent.selectComponentByName(componentName);
  }
);

When("I add a {string} control for the {string}", function (
  componentName,
  pageName
) {
  this.componentName = componentName;
  this.pageName = pageName;
  formDesigner.createComponent(pageName).click();
  createComponent.selectComponentByName(this.componentName);
  createComponent.completeCommonFields(
    fieldData[toCamelCase(this.componentName)],
    false
  );
  createComponent.selectList(fieldData.list.title);
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
  formDesigner.editPage(pageName).click();
  if (editPage.parentElement.isDisplayed() === false) {
    formDesigner.editPage(pageName).click();
  }
  editPage.duplicateBtn.click();
  editPage.closeLinks[0].click();
});

When("I choose to delete the {string}", (pageName) => {
  formDesigner.editPage(pageName).click();
  editPage.deleteBtn.click();
  acceptAlert();
  editPage.closeLinks[0].click();
});

Then("the {string} is no longer visible in the designer", (pageName) => {
  browser.waitUntil(() => formDesigner.pages.length === 2);
  chai.expect(formDesigner.pageHeadingsText).not.include(pageName);
});

Then("the list is selected in the list dropdown", function () {
  expect(editLists.selectListValue).toHaveText(fieldData.list.title);
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

When("I choose Edit page for the {string}", function (pageName) {
  this.pageName = pageName;
  formDesigner.editPage(pageName).click();
});

When("I change the page title to {string}", function (newPageName) {
  this.newPageName = newPageName;
  editPage.pageTitle.setValue(this.newPageName);
  editPage.saveBtn.click();
});

When("I change the page path to {string}", function (pathName) {
  this.pathName = pathName;
  editPage.pagePath.clearValue();
  editPage.pagePath.setValue(this.pathName);
  editPage.saveBtn.click();
});

Then("the changes are reflected in the page designer", function () {
  browser.waitUntil(
    () => formDesigner.pages[0].heading.getText() === this.newPageName
  );
  expect(formDesigner.pageHeading(this.newPageName)).toBeDisplayed();
});

When("I choose {string} from the designer menu", (menuOption) => {
  navMenu.buttonByName(menuOption).click();
});

Then("the page is added in the designer", () => {
  browser.waitUntil(() => formDesigner.pages.length === 4);
  expect(formDesigner.pageHeadingsText.includes(this.newPageName)).toEqual(
    true
  );
});

Then("the {string} is displayed when I Preview the page", function (component) {
  this.component = toCamelCase(component);
  formDesigner.previewFormPage(this.pageName).click();
  browser.switchWindow(`${this.pageName}`);
  expect(previewPage.pageTitle).toHaveText(this.pageName);
  if (component !== "Paragraph") {
    expect(previewPage.hintText(fieldData[this.component].name)).toHaveText(
      fieldData[this.component].hint
    );
    expect(
      previewPage.getComponent(fieldData[this.component].name)
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
  formDesigner.previewFormPage(pageName).click();
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

Given("I add an optional {string} control to the {string}", function (
  componentName,
  pageName
) {
  this.pageName = pageName;
  Actions.createComponentForPage(componentName, this.pageName, true, true);
});

Then("the {string} is displayed", function (pageName) {
  expect(previewPage.pageTitle).toHaveText(pageName);
});

Then("the change is reflected in the preview url", function () {
  expect(browser).toHaveUrlContaining(this.pathName);
});

When("I create a section titled {string}", function (sectionTitle) {
  this.sectionTitle = sectionTitle;
  editPage.clickLink("Create section");
  editSection.sectionTitle.setValue(this.sectionTitle);
  editSection.sectionSaveBtn.click();
  editPage.saveBtn.click();
  browser.waitUntil(
    () =>
      formDesigner.pageSectionName(this.pageName).getText() ===
      this.sectionTitle,
    { timeoutMsg: `The section ${this.sectionTitle} was not displayed` }
  );
});

Then("the section title is displayed in the preview", function () {
  expect(previewPage.sectionTitle).toHaveText(this.sectionTitle);
});

Given(/^I have created a form with a "([^"]*)" on the "([^"]*)"$/, function (
  componentName,
  pageName
) {
  this.componentName = componentName;
  this.pageName = pageName;
  Actions.createNewConfig();
  if (componentName === "Checkboxes") testActions.createList(2);
  Actions.createComponentWithList(componentName, this.pageName);
});

When(/^I continue to the next page after selecting "([^"]*)"$/, function (
  selectedChoice
) {
  switch (this.componentName) {
    case "YesNo":
      formRunner.selectRadio(selectedChoice, false);
      break;
    case "Checkboxes":
      formRunner.selectCheckbox(selectedChoice);
  }
  formRunner.continueButton.click();
});

When(/^I navigate back using the link$/, function () {
  formRunner.backLink.click();
});

Then(/^the checkbox "([^"]*)" is still checked$/, function (selectedChoice) {
  expect(formRunner.findCheckbox(selectedChoice)).toBeChecked();
});

Then(/^the radio button "([^"]*)" is still checked$/, function (
  selectedChoice
) {
  expect(formRunner.findRadio(selectedChoice)).toBeChecked();
});
