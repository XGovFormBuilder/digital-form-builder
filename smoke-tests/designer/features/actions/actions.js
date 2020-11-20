const AddComponent = require("../pageobjects/pages/addComponent.page");
const ConfigPage = require("../pageobjects/pages/config.page");
const FormDesigner = require("../pageobjects/pages/formDesigner.page");
const FieldData = require("../../data/componentFieldData");
const { toCamelCase } = require("../../support/testHelpers");

class Actions {
  createNewConfig() {
    ConfigPage.open();
    this.configRef = `smoke-testing ${Date.parse(Date())}`;
    ConfigPage.newConfig(this.configRef);
    expect(browser).toHaveUrlContaining(this.configRef.replace(" ", "-"));
  }

  createComponentForPage(componentName, pageName) {
    FormDesigner.createComponentForPageName(pageName).click();
    AddComponent.selectComponentByName(componentName);
    AddComponent.completeCommonFields(FieldData[toCamelCase(componentName)]);
  }
}

module.exports = new Actions();
