const { Given, When, Then } = require("cucumber");
const { formDesigner, previewPage } = require("../pageobjects/pages");
const {
  createComponent,
  editLists,
  navMenu,
} = require("../pageobjects/sections");
const FieldData = require("../../data/componentFieldData");
const { toCamelCase } = require("../../support/testHelpers");
const testActions = require("../actions/actions");

//FIXME:- only global lists can be created now
Given("I have created a list with {int} list item(s)", function (
  numberOfListItems
) {
  this.numberOfListItems = numberOfListItems;
  testActions.createList(this.numberOfListItems);
});

When("I add another list item to the list", function () {
  navMenu.buttonByName("Lists").click();
  editLists.clickLink(FieldData.list.title);
  editLists.createListItem.click();
  editLists.addNewListItem("Add list item", "list item 1", "1", "1");
});

Then("the Global list has {int} list items", function (listItemNumber) {
  browser.waitUntil(() => editLists.listItems.length === 2);
  expect(editLists.listItems[listItemNumber - 1]).toHaveTextContaining(
    "list item 1"
  );
});

Then("I am able to save the edited Global list", function () {
  editLists.saveBtn.click();
});

Then("the List is displayed when I Preview the page", function () {
  formDesigner.previewPageForPageName(this.pageName).click();
  browser.switchWindow(`${this.pageName}`);
  expect(previewPage.pageTitle).toHaveText(this.pageName);
  expect(previewPage.listItems).toBeElementsArrayOfSize(this.numberOfListItems);
});

When("I delete the {int}st list item from the list", function (itemNumber) {
  navMenu.clickButton("Lists");
  editLists.clickLink(FieldData.list.title);
  expect(editLists.listItems.length).toEqual(2);
  editLists.deleteListItem(itemNumber - 1);
  browser.waitUntil(() => editLists.listItems.length === 1);
});

Then("the list only has one item", function () {
  browser.waitUntil(() => editLists.listItems.length == 1);
  expect(editLists.listItems[0]).not.toHaveTextContaining("Global list item 0");
});

When("I edit the {string} component", function (componentType) {
  formDesigner.editPageComponent(componentType);
});

When("I create a new component list with {int} item", function (numberOfItems) {
  editLists.clickLink("Add a new component list");
  editLists.createListItem.click();
  editLists.addNewListItem(
    "Add list item",
    `list item ${numberOfItems}`,
    "A list item",
    `${numberOfItems}`
  );
  editLists.closeLinks[1].click();
});

When("I create a {int}nd list item for the Local list", function (
  listItemNumber
) {
  browser.pause(750);
  formDesigner.editPageComponent("list");
  if (!browser.$(".panel--flyout").isDisplayed()) {
    formDesigner.editPageComponent("list");
  }
  editLists.clickLink(`Edit ${FieldData.list.title}`);
  editLists.createListItem.click();
  editLists.addNewListItem(
    "Add list item",
    `Local list item ${listItemNumber}`,
    `${listItemNumber}`,
    `${listItemNumber}`
  );
});

Then("the Local list has {int} list items", function (listItems) {
  expect(editLists.listItems).toBeElementsArrayOfSize(listItems);
  expect(editLists.listItems[listItems - 1]).toHaveTextContaining(
    "Local list item 2"
  );
});

Then("the Local list only has one item", function () {
  expect(editLists.listItems.length).toEqual(1);
  expect(editLists.listItems[0]).not.toHaveText("Local list item 0");
});

When("I edit the {int}st list item from the list", function (listItem) {
  navMenu.clickButton("Lists");
  this.listItemTitle = "list item 3";
  editLists.clickLink(FieldData.list.title);
  expect(editLists.listItems.length).toEqual(2);
  editLists.editListItem(listItem - 1);
  editLists.addNewListItem("Edit list item", this.listItemTitle, "3", "3");
});

Then("the {int}st list item reflects the changes I made", function (listItem) {
  expect(editLists.listItems[listItem - 1]).toHaveTextContaining(
    this.listItemTitle
  );
});

When("I try add {string} to the {string} without selecting a list", function (
  componentName,
  pageName
) {
  this.pageName = pageName;
  formDesigner.createComponentForPageName(pageName).click();
  createComponent.selectComponentByName(componentName);
  createComponent.titleField.setValue(`${componentName} Component Test`);
  createComponent.saveBtn.click();
});

Then("the error summary is displayed", function () {
  expect(createComponent.errorSummary).toBeDisplayed();
});

Then(/^the "([^"]*)" is successfully created$/, function (componentName) {
  expect(
    formDesigner[toCamelCase(componentName)](this.pageName)
  ).toBeDisplayed();
});
