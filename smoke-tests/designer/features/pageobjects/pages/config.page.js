const Page = require("./basePage");

class ConfigPage extends Page {
  get pageHeading() {
    return browser.$("h1");
  }

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
    return $("h1=Enter a name for your form");
  }

  /**
   * Creates a new form with a unique name
   * @param configName
   */
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

module.exports = new ConfigPage();
