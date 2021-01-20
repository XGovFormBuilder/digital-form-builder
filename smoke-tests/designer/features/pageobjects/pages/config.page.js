const Page = require("./basePage");

class configPage extends Page {
  get newName() {
    return $(".govuk-input");
  }

  get newForm() {
    return $(".govuk-label=Create a new form");
  }

  get existingForm() {
    return $(".govuk-label=Open an existing form");
  }

  get nextBtn() {
    return browser.$(".govuk-button");
  }

  get newFormScreen() {
    return $(".govuk-label=Enter a name for your form");
  }

  newConfig(configName) {
    this.newForm.click();
    this.nextBtn.click();
    this.newFormScreen.waitForDisplayed();
    this.newName.setValue(configName);
    this.nextBtn.click();
  }

  open() {
    return super.open("app");
  }
}

module.exports = new configPage();
