const Page = require("./basePage");

class FormRunnerPage extends Page {
  open(path) {
    return browser.url(`${browser.config.runnerUrl}${path}/`);
  }

  get backLink() {
    return browser.$("a.govuk-back-link");
  }

  get pageTitle() {
    return browser.$("h1");
  }

  /**
   * Locates the index of a checkbox by label name
   * @param labelText
   */
  findCheckbox(labelText) {
    const checkboxIndex = browser
      .$$(".govuk-checkboxes__label")
      .findIndex((el) => el.getText() === labelText);
    return browser.$$(".govuk-checkboxes__input")[checkboxIndex];
  }

  /**
   * Locates the index of a radio by label name
   * @param labelText
   */
  findRadio(labelText) {
    const RadioIndex = browser
      .$$(".govuk-radios__label")
      .findIndex((el) => el.getText() === labelText);
    return browser.$$(".govuk-radios__input")[RadioIndex];
  }

  /**
   * Selects a checkbox by label name
   * @param labelText
   */
  selectCheckbox(labelText) {
    this.findCheckbox(labelText).click();
  }

  /**
   * Inputs text into a field that has a specific question
   * @param labelText
   * @param fieldValue
   */
  inputField(labelText, fieldValue) {
    let fieldIndex = browser
      .$$(".govuk-input")
      .findIndex((el) => el.parentElement().getText().includes(labelText));
    return browser.$$(".govuk-input")[fieldIndex].setValue(fieldValue);
  }

  /**
   * Inputs the address into the provided fields
   * @param dataObject
   */
  inputUkAddress(dataObject) {
    this.inputField("Address line 1", dataObject.line1);
    this.inputField("Address line 2", dataObject.line2);
    this.inputField("Town or city", dataObject.townOrCity);
    this.inputField("Postcode", dataObject.postCode);
  }

  get fieldSet() {
    return browser.$(".govuk-fieldset");
  }

  get textArea() {
    return browser.$(".govuk-textarea");
  }

  /**
   * Selects a value from a list
   * @param listValue
   */
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

  /**
   * Used to input the date for a date parts field
   * @param day
   * @param month
   * @param year
   */
  inputDate(day, month, year) {
    this.inputField("Day", day);
    this.inputField("Month", month);
    this.inputField("Year", year);
  }

  get continueButton() {
    return browser.$("#submit");
  }

  get submitButton() {
    return browser.$(".govuk-button");
  }

  /**
   * Inputs text into a multiline text component and then clicks continue
   * @param text
   */
  inputTextBox(text) {
    this.textArea.waitForDisplayed();
    this.textArea.setValue(text);
    this.continueButton.click();
  }

  get submissionConfirmation() {
    return browser.$(".govuk-panel--confirmation");
  }

  /**
   * Retrieves the answer element by using the question asked
   * @param question
   * @returns {Element}
   */
  summaryAnswer(question) {
    browser.$(".govuk-summary-list").waitForDisplayed();
    return browser
      .$$(".govuk-summary-list__key")
      .find((el) => el.getText() === question)
      .nextElement();
  }

  get flashCardContinueBtn() {
    return browser.$(".flash-card .govuk-button");
  }

  get paragraph() {
    return browser.$(".govuk-body");
  }

  selectDropdownOption(selectedOption) {
    return browser.$(".govuk-select").selectByVisibleText(selectedOption);
  }
}

module.exports = new FormRunnerPage();
