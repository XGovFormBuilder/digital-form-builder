const { Given, When, Then } = require("cucumber");
const AddComponentPage = require("../pageobjects/pages/addComponent.page");
const EditListSection = require("../pageobjects/sections/editLists.section");
const FormDesignerPage = require("../pageobjects/pages/formDesigner.page");
const MenuSection = require("../pageobjects/sections/menu.section");
const FieldData = require("../../data/componentFieldData");
const { toCamelCase } = require("../../support/testHelpers");

Given("I have created a Global list with {int} list item(s)", function (
  itemNumber
) {
  MenuSection.buttonByName("Edit Lists").click();
  EditListSection.addNewList.click();
  EditListSection.listTitle.setValue("Countries");
  for (let i = 0; i < itemNumber; i++) {
    EditListSection.createListItem.click();
    EditListSection.addNewListItem(`Global list item ${i}`, `${i}`, `${i}`);
  }
  EditListSection.saveBtn.click();
});

When("I add another list item to the Global list", function () {
  EditListSection.closeLinks[0].click();
  MenuSection.buttonByName("Edit Lists").click();
  FormDesignerPage.clickLink("Countries");
  EditListSection.createListItem.click();
  EditListSection.addNewListItem("Global list item 1", "1", "1");
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

When(/^I delete a list item from the global list$/, function () {
  FormDesignerPage.clickLink("Countries");
  expect(EditListSection.listItems.length).toEqual(2);
  EditListSection.deleteListItem("0");
});

Then(/^the Global list only has one item$/, function () {
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
    `list item ${numberOfItems}`,
    "A list item",
    `${numberOfItems}`
  );
  EditListSection.closeLinks[1].click();
});

Given("I have created a Local list with {int} list item(s)", function (
  itemNumber
) {
  FormDesignerPage.createComponentForPageName("First page").click();
  AddComponentPage.selectComponentByName("List");
  AddComponentPage.completeCommonFields(FieldData[toCamelCase("List")]);
  FormDesignerPage.editPageComponent("list");
  EditListSection.clickLink("Add a new component list");
  for (let i = 0; i < itemNumber; i++) {
    EditListSection.clickLink("Create list item");
    EditListSection.addNewListItem(
      `Local list item ${i}`,
      "A list item",
      `${i}`
    );
  }
  EditListSection.closeLinks[1].click();
  EditListSection.saveBtn.click();
});

//   EditListSection.closeLinks[1].click();
//   MenuSection.buttonByName("Edit Lists").click();
//   EditListSection.addNewList.click();
//   EditListSection.listTitle.setValue("Countries");
//   console.log(itemNumber);
//   for (let i = 0; i < itemNumber; i++) {
//     EditListSection.createListItem.click();
//     EditListSection.addNewListItem(`Global list item ${i}`, `${i}`, `${i}`);
//   }
//   EditListSection.saveBtn.click();
// });
When("I create a {int}nd list item for the Local list", function (
  listItemNumber
) {
  FormDesignerPage.editPageComponent("list");
  EditListSection.clickLink(`Edit ${FieldData.list.title}`);
  EditListSection.createListItem.click();
  EditListSection.addNewListItem(
    `Local list item ${listItemNumber}`,
    `${listItemNumber}`,
    `${listItemNumber}`
  );
});

Then(/^the Local list has (\d+) list items$/, function (listItems) {
  expect(EditListSection.listItems.length).toEqual(listItems);
  expect(EditListSection.listItems[listItems - 1]).toHaveTextContaining(
    "Local list item 2"
  );
});

When(/^I delete a list item from the Local list$/, function () {
  FormDesignerPage.editPageComponent("list");
  EditListSection.clickLink(`Edit ${FieldData.list.title}`);
  expect(EditListSection.listItems.length).toEqual(2);
  EditListSection.deleteListItem("Local list item 0");
});

Then(/^the Local list only has one item$/, function () {
  expect(EditListSection.listItems.length).toEqual(1);
  expect(EditListSection.listItems[0]).not.toHaveText("Local list item 0");
});
