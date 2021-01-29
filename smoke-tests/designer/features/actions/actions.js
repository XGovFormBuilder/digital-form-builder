const addComponent = require("../pageobjects/pages/addComponent.page");
const configPage = require("../pageobjects/pages/config.page");
const formDesigner = require("../pageobjects/pages/formDesigner.page");
const fieldData = require("../../data/componentFieldData");
const { toCamelCase } = require("../../support/testHelpers");
const { nanoid } = require("nanoid");

class Actions {
  createNewConfig() {
    configPage.open();
    this.configRef = `smoke-testing-${nanoid(10)}`;
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
    addComponent.selectComponentByName(componentName);
    if (componentName.toLowerCase() === "paragraph") {
      addComponent.paragraphSetText(
        fieldData[componentName.toLowerCase()].content
      );
      addComponent.saveBtn.click();
    } else {
      addComponent.completeCommonFields(fieldData[toCamelCase(componentName)]);
    }
  }
}

module.exports = new Actions();
