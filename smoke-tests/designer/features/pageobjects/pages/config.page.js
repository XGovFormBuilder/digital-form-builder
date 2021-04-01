const Page = require("./basePage");

class ConfigPage extends Page {
  get pageHeading() {
    return browser.$("h1");
  }

  get newName() {
    browser.$(".govuk-input").waitForDisplayed();
    return browser.$(".govuk-input");
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

  errorSummaryErrors() {
    return browser.$$(".govuk-error-summary__list li a");
  }

  get formError() {
    browser.$(".govuk-error-message").waitForDisplayed();
    return browser.$(".govuk-error-message");
  }

  open() {
    return super.open("app");
  }
}

module.exports = new ConfigPage();
