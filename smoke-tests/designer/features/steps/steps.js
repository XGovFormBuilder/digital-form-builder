const chai = require("chai");
const { Given, When, Then } = require("cucumber");
const AddComponentPage = require("../pageobjects/pages/addComponent.page");
const AddLinkSection = require("../pageobjects/sections/addLink.section");
const EditListSection = require("../pageobjects/sections/editLists.section");
const EditPageSection = require("../pageobjects/sections/editPage.section");
const EditSection = require("../pageobjects/sections/editSection.section");
const FormDesignerPage = require("../pageobjects/pages/formDesigner.page");
const MenuSection = require("../pageobjects/sections/menu.section");
const FieldData = require("../../data/componentFieldData");
const PreviewPage = require("../pageobjects/pages/preview.page");
const { acceptAlert, toCamelCase } = require("../../support/testHelpers");
const Actions = require("../actions/actions");

Given("I have created a new form configuration", () => {
  Actions.createNewConfig();
});

When("I choose to create a component for the {string}", function (pageName) {
  FormDesignerPage.createComponentForPageName(pageName).click();
});

When("I select {string} component to add to the page", function (
  componentName
) {
  this.componentName = componentName;
  AddComponentPage.selectComponentByName(this.componentName);
});

Then(
  "I am able to return to components list with creating the component",
  function () {
    AddComponentPage.backToComponentList.click();
    expect(AddComponentPage.sectionHeading).toHaveText("Create component");
    expect(AddComponentPage.addComponent).toBeDisplayed();
  }
);

Then("the {string} control is displayed in the {string}", function (
  componentName,
  pageName
) {
  this.pageName = pageName;
  const ccCompName = toCamelCase(componentName);
  const componentEl = FormDesignerPage.getComponentOnPage(pageName, ccCompName);
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
        FormDesignerPage.getComponentOnPage(
          pageName,
          toCamelCase(component)
        ).isDisplayed()
      ).to.be.true
  );
});

When(
  "I delete the {string} control from the {string}",
  (componentName, pageName) => {
    FormDesignerPage.getComponentOnPage(
      pageName,
      toCamelCase(componentName)
    ).waitForDisplayed();
    FormDesignerPage.getComponentOnPage(
      pageName,
      toCamelCase(componentName)
    ).click();
    AddComponentPage.deleteLink.click();
  }
);

Then(
  "the {string} will not be visible in the {string}",
  (componentName, pageName) => {
    FormDesignerPage.getComponentOnPage(
      pageName,
      toCamelCase(componentName)
    ).waitForDisplayed({ reverse: true });
    chai.expect(
      FormDesignerPage.getComponentOnPage(
        pageName,
        toCamelCase(componentName)
      ).isDisplayed()
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
  expect(FormDesignerPage.linkLine).toExist();
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
  FormDesignerPage.editPageForPageName("First page").click();
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
    FormDesignerPage.createComponentForPageName(pageName).click();
    AddComponentPage.selectComponentByName(componentName);
  }
);

When("I add a {string} control for the {string}", function (
  componentName,
  pageName
) {
  this.pageName = pageName;
  EditListSection.closeLinks[0].click();
  FormDesignerPage.createComponentForPageName(pageName).click();
  AddComponentPage.selectComponentByName(componentName);
  AddComponentPage.completeCommonFields(
    FieldData[toCamelCase(componentName)],
    false
  );
  AddComponentPage.selectList(FieldData.list.title);
  AddComponentPage.saveBtn.click();
});

Then("the list is available in the list options", function () {
  expect(AddComponentPage.listOptions).toHaveText(this.listName);
});

When("I choose to duplicate the {string}", (pageName) => {
  FormDesignerPage.editPageForPageName(pageName).click();
  if (EditPageSection.parentElement.isDisplayed() === false) {
    FormDesignerPage.editPageForPageName(pageName).click();
  }
  EditPageSection.duplicateBtn.click();
  EditPageSection.closeLinks[0].click();
});

Then(
  "{int} {string} pages are shown in the designer",
  (numberOfPages, pageName) => {
    expect(FormDesignerPage.retrieveNumberOfPagesMatching(pageName)).toEqual(
      numberOfPages
    );
  }
);

When("I choose to delete the {string}", (pageName) => {
  FormDesignerPage.editPageForPageName(pageName).click();
  EditPageSection.deleteBtn.click();
  acceptAlert();
  EditPageSection.closeLinks[0].click();
});

Then("the {string} is no longer visible in the designer", (pageName) => {
  const pageNames = [];
  FormDesignerPage.formPageTitles.forEach((elem) => {
    pageNames.push(elem.getText());
  });
  expect(FormDesignerPage.formPages.length).toEqual(2);
  chai.expect(pageNames).not.include(pageName);
});

Then("the list is selected in the list dropdown", function () {
  expect(EditListSection.selectListValue).toHaveText(FieldData.list.title);
});

When("I add a {string} control to the {string}", (componentName, pageName) => {
  this.pageName = pageName;
  FormDesignerPage.createComponentForPageName(pageName).click();
  AddComponentPage.selectComponentByName(componentName);
  expect(AddComponentPage.backToComponentList).toBeDisplayed();
  switch (componentName) {
    case "Paragraph":
      AddComponentPage.paragraphSetText(
        `You need the vehicle’s number plate (registration number).\n
          You can see the results as soon as the MOT centre has recorded the test result.\n
          You’ll need the 11-digit number from the vehicle’s log book (V5C) to see the test location.`
      );
      AddComponentPage.saveBtn.click();
      break;
    default:
      AddComponentPage.completeCommonFields(
        FieldData[toCamelCase(componentName)]
      );
      break;
  }
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
  browser.waitUntil(
    () => FormDesignerPage.formPageTitles[0].getText() === "testing"
  );
  expect(FormDesignerPage.getTitleTextForPage(this.newPageName)).toBe(
    this.newPageName
  );
});

When("I choose {string} from the designer menu", (menuOption) => {
  MenuSection.buttonByName(menuOption).click();
});

Then("the page is added in the designer", () => {
  browser.waitUntil(() => FormDesignerPage.formPages.length === 4);
  this.pageNames = FormDesignerPage.formPageTitles.map(function (element) {
    return element.getText();
  });
  expect(this.pageNames.includes(this.newPageName)).toEqual(true);
});

Then("the {string} is displayed when I Preview the page", function (component) {
  this.component = toCamelCase(component);
  FormDesignerPage.previewPageForPageName(this.pageName).click();
  browser.switchWindow(`${this.pageName}`);
  expect(PreviewPage.pageTitle).toHaveText(this.pageName);
  if (component !== "Paragraph") {
    expect(PreviewPage.hintText(FieldData[this.component].name)).toHaveText(
      FieldData[this.component].hint
    );
    expect(
      PreviewPage.getComponent(FieldData[this.component].name)
    ).toBeDisplayed();
  } else {
    expect(PreviewPage.paragraph).toBeDisplayed();
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
