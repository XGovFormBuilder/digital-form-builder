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

Then(
  "the {string} control is displayed in the {string}",
  (componentName, pageName) => {
    const pageComponent = toCamelCase(componentName);
    switch (pageComponent) {
      case "dateField":
        chai.expect(FormDesignerPage[pageComponent](pageName).isDisplayed()).to
          .be.true;
        expect(FormDesignerPage[pageComponent](pageName)).toHaveText(
          "dd/mm/yyyy"
        );
        break;
      case "dateTimeField":
        chai.expect(FormDesignerPage[pageComponent](pageName).isDisplayed()).to
          .be.true;
        expect(FormDesignerPage[pageComponent](pageName)).toHaveText(
          "dd/mm/yyyy hh:mm"
        );
        break;
      default:
        chai.expect(FormDesignerPage[pageComponent](pageName).isDisplayed()).to
          .be.true;
        break;
    }
  }
);

When("I add multiple components to the {string}", (pageName) => {
  this.pageComponents = ["Email address field", "Date field"];
  this.pageComponents.forEach((component) =>
    Actions.createComponentForPage(component, pageName)
  );
});

Then("all the components are displayed in the {string}", (pageName) => {
  this.pageComponents.forEach(
    (component) =>
      chai.expect(
        FormDesignerPage[toCamelCase(component)](pageName).isDisplayed()
      ).to.be.true
  );
});

When(
  "I delete the {string} control from the {string}",
  (componentName, pageName) => {
    const pageComponent = toCamelCase(componentName);
    FormDesignerPage[pageComponent](pageName).click();
    AddComponentPage.deleteLink.click();
  }
);

Then(
  "the {string} will not be visible in the {string}",
  (componentName, pageName) => {
    const pageComponent = toCamelCase(componentName);
    chai.expect(FormDesignerPage[pageComponent](pageName).isDisplayed()).to.be
      .false;
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
    "Add a new list item",
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

Then("the list is available in the list options", function () {
  expect(AddComponentPage.listOptions).toHaveText(this.listName);
});

When("I choose to duplicate the {string}", (pageName) => {
  FormDesignerPage.editPageForPageName(pageName).click();
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
  expect(FormDesignerPage.formPages.length).toEqual(1);
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
  FormDesignerPage.designerMenu.waitForDisplayed();
  console.log(FormDesignerPage.getTitleTextForPage(this.newPageName));
  expect(FormDesignerPage.getTitleTextForPage(this.newPageName)).toBe(
    this.newPageName
  );
});

When("I choose {string} from the designer menu", (menuOption) => {
  MenuSection.buttonByName(menuOption).click();
});

Then("the page is added in the designer", () => {
  const pageName = this.newPageName.toLowerCase().replace(" ", "-");
  FormDesignerPage.designerMenu.waitForDisplayed();
  expect(FormDesignerPage.getTitleTextForPage(pageName)).toBe(this.newPageName);
});
