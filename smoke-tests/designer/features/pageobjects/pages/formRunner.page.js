class FormRunnerPage {
  open(path) {
    return browser.url(`${browser.config.runnerUrl}${path}/`);
  }
  get pageTitle() {
    return browser.$("h1");
  }

  get fieldSet() {
    return browser.$(".govuk-fieldset");
  }

  get textArea() {
    return browser.$(".govuk-textarea");
  }

  /**
   * Select radio using part of its name and then clicks continue
   * @param radioName
   */
  selectRadio(radioName) {
    this.fieldSet.waitForDisplayed();
    browser
      .$$(".govuk-radios__label")
      .find((el) => el.getText().includes(radioName))
      .click();
    this.continueButton.click();
  }

  get continueButton() {
    return browser.$(".govuk-button");
  }

  /**
   * Inputs text into a multiline text component and then clicks continue
   * @param text
   */
  multilineText(text) {
    this.textArea.waitForDisplayed();
    this.textArea.setValue(text);
    this.continueButton.click();
  }

  get submissionConfirmation() {
    return browser.$(".govuk-panel--confirmation");
  }
}

module.exports = new FormRunnerPage();
