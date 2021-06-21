const { configPage, formDesigner } = require("../pageobjects/pages");
const {
  createComponent,
  editLists,
  navMenu,
} = require("../pageobjects/sections");
const fieldData = require("../../data/componentFieldData");
const { toCamelCase } = require("../../support/testHelpers");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789_-abcdefghijklmnopqrstuvwxyz", 10);

class Actions {
  configRef;
  createNewConfig() {
    configPage.open();
    this.configRef = `smoke-testing-${nanoid()}`;
    configPage.newConfig(this.configRef);
    configPage.designerMenu.waitForDisplayed();
    expect(browser).toHaveUrlContaining(
      this.configRef.replace(" ", "-").toLowerCase()
    );
    return this.configRef;
  }

  /**
   * Creates a component for a page by name using default data
   * @param componentName
   * @param pageName
   */
  createComponentForPage(
    componentName,
    pageName,
    makeOptional = false,
    save = true
  ) {
    formDesigner.createComponent(pageName).click();
    createComponent.selectComponentByName(componentName);
    if (componentName.toLowerCase() === "paragraph") {
      createComponent.paragraphSetText(
        fieldData[componentName.toLowerCase()].content
      );
      createComponent.saveBtn.click();
    } else {
      createComponent.completeCommonFields(
        fieldData[toCamelCase(componentName)],
        false,
        makeOptional,
        save
      );
    }
  }

  /**
   * Creates a component with a list
   * @param componentName
   * @param pageName
   * @param makeOptional
   * @param save
   */
  createComponentWithList(
    componentName,
    pageName,
    makeOptional = false,
    save = true
  ) {
    formDesigner.createComponent(pageName).click();
    createComponent.selectComponentByName(componentName);
    createComponent.selectList(fieldData.list.title);
    createComponent.completeCommonFields(
      fieldData[toCamelCase(componentName)],
      false,
      makeOptional,
      save
    );
  }

  /**
   * Creates a list using 'Lists' with a number of specified list items
   * @param numberOfListItems
   * @param closeFlyout
   */
  createList(numberOfListItems, closeFlyout = true) {
    navMenu.buttonByName("Lists").click();
    editLists.addNewList.click();
    editLists.listTitle.setValue(fieldData.list.title);
    editLists.createListWithListItems(numberOfListItems);
    editLists.saveBtn.click();
    if (closeFlyout) {
      editLists.clickLink("Close");
    }
  }
}

module.exports = new Actions();
