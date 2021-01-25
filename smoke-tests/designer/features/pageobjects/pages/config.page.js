const Page = require("./basePage");

class configPage extends Page {
  get newName() {
    return browser.$(".govuk-input");
  }

  /**
   * Creates a new form with a unique name
   * @param configName
   */
  newConfig(configName) {
    this.newName.setValue(configName);
    this.clickButton("Next");
    this.designerMenu.waitForDisplayed();
  }

  open() {
    return super.open("app");
  }
}

module.exports = new configPage();
