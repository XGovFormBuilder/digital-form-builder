const Page = require("./basePage");

class configPage extends Page {
  get newName() {
    return $(".govuk-input");
  }
  get startBtn() {
    return $(".govuk-button");
  }

  newConfig(configName) {
    this.newName.setValue(configName);
    this.startBtn.click();
    this.designerMenu.waitForDisplayed();
  }

  open() {
    return super.open("app");
  }
}

module.exports = new configPage();
