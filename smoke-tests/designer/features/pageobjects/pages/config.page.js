const Page = require("./basePage");

class configPage extends Page {
  get pageHeader() {
    return browser.$("h1");
  }

  get newName() {
    return browser.$(".govuk-input");
  }

  get nameError() {
    return browser.$("#error-name-required");
  }

  get startBtn() {
    return browser.$(".govuk-button");
  }

  newConfig(configName) {
    this.newName.setValue(configName);
    this.startBtn.click();
    this.designerMenu.waitForDisplayed();
  }

  open() {
    return super.open("new");
  }
}

module.exports = new configPage();
