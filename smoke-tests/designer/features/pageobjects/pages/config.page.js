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
    return browser.$(".govuk-label=Create a new form");
  }

  get existingForm() {
    return browser.$(".govuk-label=Open an existing form");
  }

  get nextBtn() {
    return browser.$(".govuk-button");
  }

  get backToPreviousPage() {
    return browser.$("a.govuk-back-link");
  }

  get newFormScreen() {
    return browser.$("h1=Enter a name for your form");
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

  /**
   * Returns an array from the error summary
   * @returns {WebdriverIO.ElementArray}
   */
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
