const Page = require("./page");

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
  }

  open() {
    return super.open("new");
  }
}

module.exports = new configPage();
