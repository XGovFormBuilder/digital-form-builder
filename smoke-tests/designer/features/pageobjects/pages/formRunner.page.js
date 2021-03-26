class FormRunnerPage {
  open(path) {
    return browser.url(`${browser.config.runnerUrl}${path}/`);
  }
  get pageTitle() {
    return browser.$("h1");
  }

  selectCheckbox(labelText) {
    const checboxIndex = browser
      .$$(".govuk-checkboxes__label")
      .findIndex((el) => el.getText() === labelText);
    return browser.$$(".govuk-checkboxes__input")[checboxIndex].click();
  }

  inputField(labelText, fieldValue) {
    let fieldIndex = browser
      .$$(".govuk-input")
      .findIndex((el) => el.parentElement().getText().includes(labelText));
    return browser.$$(".govuk-input")[fieldIndex].setValue(fieldValue);
  }

  ukAddress(dataObject) {
    this.inputField("Address line 1", dataObject.addressLine1);
    this.inputField("Address line 2", dataObject.addressLine2);
    this.inputField("Town or city", dataObject.townOrCity);
    this.inputField("Postcode", dataObject.postCode);
  }

  get fieldSet() {
    return browser.$(".govuk-fieldset");
  }

  get textArea() {
    return browser.$(".govuk-textarea");
  }

  selectFromList(listValue) {
    return browser.$(".govuk-select").selectByVisibleText(listValue);
  }

  /**
   * Select radio using part of its name and then clicks continue
   * @param radioName
   */
  selectRadio(radioName, save = true) {
    this.fieldSet.waitForDisplayed();
    browser
      .$$(".govuk-radios__label")
      .find((el) => el.getText().includes(radioName))
      .click();
    if (save) {
      this.continueButton.click();
    }
  }

  inputDate(day, month, year) {
    this.inputField("Day", day);
    this.inputField("Month", month);
    this.inputField("Year", year);
  }

  get continueButton() {
    return browser.$(".govuk-button");
  }

  /**
   * Inputs text into a multiline text component and then clicks continue
   * @param text
   */
  textBox(text) {
    this.textArea.waitForDisplayed();
    this.textArea.setValue(text);
    this.continueButton.click();
  }

  get submissionConfirmation() {
    return browser.$(".govuk-panel--confirmation");
  }
}

module.exports = new FormRunnerPage();
