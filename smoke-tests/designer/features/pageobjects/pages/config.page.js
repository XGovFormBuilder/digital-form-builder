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
    this.clickButton("Start");
    this.designerMenu.waitForDisplayed();
  }

  open() {
    return super.open("new");
  }
}

module.exports = new configPage();
