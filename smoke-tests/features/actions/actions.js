const ConfigPage = require("../pageobjects/pages/config.page");

class Actions {
  createNewConfig() {
    ConfigPage.open();
    this.configRef = `smoke-testing ${Date.parse(Date())}`;
    ConfigPage.newConfig(this.configRef);
    expect(browser).toHaveUrlContaining(this.configRef.replace(" ", "-"));
  }
}

module.exports = new Actions();
