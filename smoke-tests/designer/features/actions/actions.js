const { configPage, formDesigner } = require("../pageobjects/pages");
const createComponent = require("../pageobjects/sections/createComponent.section");
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
  }

  /**
   * Creates a component for a page by name using default data
   * @param componentName
   * @param pageName
   */
  createComponentForPage(componentName, pageName) {
    formDesigner.createComponentForPageName(pageName).click();
    createComponent.selectComponentByName(componentName);
    if (componentName.toLowerCase() === "paragraph") {
      createComponent.paragraphSetText(
        fieldData[componentName.toLowerCase()].content
      );
      createComponent.saveBtn.click();
    } else {
      createComponent.completeCommonFields(
        fieldData[toCamelCase(componentName)]
      );
    }
  }
}

module.exports = new Actions();
