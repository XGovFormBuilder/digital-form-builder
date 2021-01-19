const { Given, When, Then } = require("cucumber");
const AddComponentPage = require("../pageobjects/pages/addComponent.page");
const EditListSection = require("../pageobjects/sections/editLists.section");
const FormDesignerPage = require("../pageobjects/pages/formDesigner.page");
const MenuSection = require("../pageobjects/sections/menu.section");
const FieldData = require("../../data/componentFieldData");
const { toCamelCase } = require("../../support/testHelpers");

Given("I have created a {string} list with {int} list item(s)", function (
  listType,
  numberOfListItems
) {
  switch (listType.toLowerCase()) {
    case "local":
      FormDesignerPage.createComponentForPageName("First page").click();
      AddComponentPage.selectComponentByName("List");
      AddComponentPage.completeCommonFields(FieldData[toCamelCase("List")]);
      FormDesignerPage.editPageComponent("list");
      EditListSection.clickLink("Add a new component list");
      EditListSection.createListWithListItems(listType, numberOfListItems);
      EditListSection.closeLinks[1].click();
      EditListSection.saveBtn.click();
      break;
    case "global":
      MenuSection.buttonByName("Edit Lists").click();
      EditListSection.addNewList.click();
      EditListSection.listTitle.setValue(FieldData.list.title);
      EditListSection.createListWithListItems(listType, numberOfListItems);
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
    "Add a new list item",
    "Global list item 1",
    "1",
    "1"
  );
});

Then("the Global list has {int} list items", function (listItemNumber) {
  expect(EditListSection.listItems.length).toEqual(listItemNumber);
  expect(EditListSection.listItems[listItemNumber - 1]).toHaveTextContaining(
    "Global list item 1"
  );
});

Then("I am able to save the edited Global list", function () {
  EditListSection.saveBtn.click();
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
      FormDesignerPage.editPageComponent("list");
      EditListSection.clickLink(`Edit ${FieldData.list.title}`);
      break;
  }
  expect(EditListSection.listItems.length).toEqual(2);
  EditListSection.deleteListItem(itemNumber - 1);
});

Then("the Global list only has one item", function () {
  expect(EditListSection.listItems.length).toEqual(1);
  expect(EditListSection.listItems[0]).not.toHaveTextContaining(
    "Global list item 0"
  );
});

When("I edit the {string} component", function (componentType) {
  FormDesignerPage.editPageComponent(componentType);
});

When("I create a new component list with {int} item", function (numberOfItems) {
  EditListSection.clickLink("Add a new component list");
  EditListSection.clickLink("Create list item");
  EditListSection.addNewListItem(
    "Add a new list item",
    `list item ${numberOfItems}`,
    "A list item",
    `${numberOfItems}`
  );
  EditListSection.closeLinks[1].click();
});

When("I create a {int}nd list item for the Local list", function (
  listItemNumber
) {
  FormDesignerPage.editPageComponent("list");
  EditListSection.clickLink(`Edit ${FieldData.list.title}`);
  EditListSection.createListItem.click();
  EditListSection.addNewListItem(
    "Add a new list item",
    `Local list item ${listItemNumber}`,
    `${listItemNumber}`,
    `${listItemNumber}`
  );
});

Then("the Local list has {int} list items", function (listItems) {
  expect(EditListSection.listItems.length).toEqual(listItems);
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
    FormDesignerPage.editPageComponent("list");
    EditListSection.clickLink(`Edit ${FieldData.list.title}`);
  } else {
    EditListSection.clickLink(FieldData.list.title);
  }
  expect(EditListSection.listItems.length).toEqual(2);
  EditListSection.editListItem(listItem - 1);
  EditListSection.addNewListItem(
    "Editing list item",
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
