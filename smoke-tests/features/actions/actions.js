const ConfigPage = require("../pageobjects/pages/config.page");
const MenuSection = require("../pageobjects/sections/menu.section");
const AddPageSection = require("../pageobjects/sections/add-page.section");
const FormDesignerPage = require("../pageobjects/pages/form-designer.page");
const { convertTypeAcquisitionFromJson } = require("typescript");

class Actions {
  createNewConfig() {
    ConfigPage.open();
    this.configRef = `smoke-testing ${Date.parse(Date())}`;
    ConfigPage.newConfig(this.configRef);
    expect(browser).toHaveUrlContaining(this.configRef.replace(" ", "-"));
  }
}

module.exports = new Actions();
