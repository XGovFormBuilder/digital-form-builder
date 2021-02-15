const { Given, When, Then } = require("cucumber");
const AddComponentPage = require("../pageobjects/pages/addComponent.page");
const EditListSection = require("../pageobjects/sections/editLists.section");
const FormDesignerPage = require("../pageobjects/pages/formDesigner.page");
const MenuSection = require("../pageobjects/sections/menu.section");
const FieldData = require("../../data/componentFieldData");
const PreviewPage = require("../pageobjects/pages/preview.page");
const { toCamelCase } = require("../../support/testHelpers");

Given("I have created a {string} list with {int} list item(s)", function (
  listType,
  numberOfListItems
) {
  this.numberOfListItems = numberOfListItems;
  switch (listType.toLowerCase()) {
    case "local":
      FormDesignerPage.createComponentForPageName("First page").click();
      AddComponentPage.selectComponentByName("List");
      AddComponentPage.completeCommonFields(FieldData[toCamelCase("List")]);
      FormDesignerPage.editPageComponent("list");
      EditListSection.clickLink("Add a new component list");
      EditListSection.createListWithListItems(listType, this.numberOfListItems);
      EditListSection.closeLinks[1].click();
      EditListSection.saveBtn.click();
      break;
    case "global":
      MenuSection.buttonByName("Edit Lists").click();
      EditListSection.addNewList.click();
      EditListSection.listTitle.setValue(FieldData.list.title);
      EditListSection.createListWithListItems(listType, this.numberOfListItems);
      EditListSection.saveBtn.click();
      break;
  }
});

When("I add another list item to the Global list", function () {
  EditListSection.closeLinks[0].click();
  MenuSection.buttonByName("Edit Lists").click();
  EditListSection.clickLink(FieldData.list.title);
  EditListSection.createListItem.click();
  EditListSection.addNewListItem(
    "Add list item",
    "Global list item 1",
    "1",
    "1"
  );
});

Then("the Global list has {int} list items", function (listItemNumber) {
  browser.waitUntil(() => EditListSection.listItems.length === 2);
  expect(EditListSection.listItems[listItemNumber - 1]).toHaveTextContaining(
    "Global list item 1"
  );
});

Then("I am able to save the edited Global list", function () {
  EditListSection.saveBtn.click();
});

Then("the List is displayed when I Preview the page", function () {
  FormDesignerPage.previewPageForPageName(this.pageName).click();
  browser.switchWindow(`${this.pageName}`);
  expect(PreviewPage.pageTitle).toHaveText(this.pageName);
  expect(PreviewPage.listItems).toBeElementsArrayOfSize(this.numberOfListItems);
});

When("I delete the {int}st list item from the {string} list", function (
  itemNumber,
  listType
) {
  switch (listType.toLowerCase()) {
    case "global":
      EditListSection.clickLink(FieldData.list.title);
      break;
    case "local":
      browser.pause(750);
      FormDesignerPage.editPageComponent("list");
      if (!browser.$(".panel--flyout").isDisplayed()) {
        FormDesignerPage.editPageComponent("list");
      }
      EditListSection.clickLink(`Edit ${FieldData.list.title}`);
      break;
  }
  expect(EditListSection.listItems.length).toEqual(2);
  EditListSection.deleteListItem(itemNumber - 1);
  browser.waitUntil(() => EditListSection.listItems.length === 1);
});

Then("the Global list only has one item", function () {
  browser.waitUntil(() => EditListSection.listItems.length == 1);
  expect(EditListSection.listItems[0]).not.toHaveTextContaining(
    "Global list item 0"
  );
});

When("I edit the {string} component", function (componentType) {
  FormDesignerPage.editPageComponent(componentType);
});

When("I create a new component list with {int} item", function (numberOfItems) {
  EditListSection.clickLink("Add a new component list");
  EditListSection.createListItem.click();
  EditListSection.addNewListItem(
    "Add list item",
    `list item ${numberOfItems}`,
    "A list item",
    `${numberOfItems}`
  );
  EditListSection.closeLinks[1].click();
});

When("I create a {int}nd list item for the Local list", function (
  listItemNumber
) {
  browser.pause(750);
  FormDesignerPage.editPageComponent("list");
  if (!browser.$(".panel--flyout").isDisplayed()) {
    FormDesignerPage.editPageComponent("list");
  }
  EditListSection.clickLink(`Edit ${FieldData.list.title}`);
  EditListSection.createListItem.click();
  EditListSection.addNewListItem(
    "Add list item",
    `Local list item ${listItemNumber}`,
    `${listItemNumber}`,
    `${listItemNumber}`
  );
});

Then("the Local list has {int} list items", function (listItems) {
  expect(EditListSection.listItems).toBeElementsArrayOfSize(listItems);
  expect(EditListSection.listItems[listItems - 1]).toHaveTextContaining(
    "Local list item 2"
  );
});

Then("the Local list only has one item", function () {
  expect(EditListSection.listItems.length).toEqual(1);
  expect(EditListSection.listItems[0]).not.toHaveText("Local list item 0");
});

When("I edit the {int}st list item from the {string} list", function (
  listItem,
  listType
) {
  this.listItemTitle = `${listType} list item 3`;
  if (listType.toLowerCase() === "local") {
    browser.pause(500);
    FormDesignerPage.editPageComponent("list");
    if (!browser.$(".panel--flyout").isDisplayed()) {
      FormDesignerPage.editPageComponent("list");
    }
    EditListSection.clickLink(`Edit ${FieldData.list.title}`);
  } else {
    EditListSection.clickLink(FieldData.list.title);
  }
  expect(EditListSection.listItems.length).toEqual(2);
  EditListSection.editListItem(listItem - 1);
  EditListSection.addNewListItem(
    "Edit list item",
    this.listItemTitle,
    "3",
    "3"
  );
});

Then("the {int}st list item reflects the changes I made", function (listItem) {
  expect(EditListSection.listItems[listItem - 1]).toHaveTextContaining(
    this.listItemTitle
  );
});
