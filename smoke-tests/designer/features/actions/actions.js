const AddComponent = require("../pageobjects/pages/addComponent.page");
const ConfigPage = require("../pageobjects/pages/config.page");
const FormDesigner = require("../pageobjects/pages/formDesigner.page");
const FieldData = require("../../data/componentFieldData");
const { toCamelCase } = require("../../support/testHelpers");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789_-abcdefghijklmnopqrstuvwxyz", 10);

class Actions {
  configRef;
  createNewConfig() {
    ConfigPage.open();
    this.configRef = `smoke-testing-${nanoid()}`;
    ConfigPage.newConfig(this.configRef);
    ConfigPage.designerMenu.waitForDisplayed();
    expect(browser).toHaveUrlContaining(
      this.configRef.replace(" ", "-").toLowerCase()
    );
  }

  createComponentForPage(componentName, pageName) {
    FormDesigner.createComponentForPageName(pageName).click();
    AddComponent.selectComponentByName(componentName);
    AddComponent.completeCommonFields(FieldData[toCamelCase(componentName)]);
  }
}

module.exports = new Actions();
