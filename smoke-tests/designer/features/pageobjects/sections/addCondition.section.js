const Page = require("../pages/basePage");

class AddConditionSection extends Page {
  /**
   * Returns an array of conditions links
   * @returns {WebdriverIO.ElementArray}
   */
  get conditionLinks() {
    browser.$("[data-testid='conditions-list-item'] a").waitForDisplayed();
    return browser.$$("[data-testid='conditions-list-item'] a");
  }

  getConditionLink(linkText) {
    return this.conditionLinks.find((el) => el.getText().includes(linkText));
  }

  get displayName() {
    return browser.$("#cond-name");
  }

  /**
   * Inputs the Display name of the condition
   * @param name
   */
  inputDisplayName(name) {
    return this.displayName.setValue(name);
  }

  get conditionField() {
    return browser.$("#cond-field");
  }
  /**
   * Selects condition from select list
   * @param conditionName
   */
  selectCondition(conditionName) {
    return this.conditionField.selectByVisibleText(conditionName);
  }

  /**
   * Selects operator from select list
   * @param conditionName
   */
  selectOperator(conditionName) {
    browser.$("#cond-operator").waitForDisplayed();
    return browser.$("#cond-operator").selectByVisibleText(conditionName);
  }

  selectValue(conditionValue) {
    browser.$("#cond-value").waitForDisplayed();
    return browser.$("#cond-value").selectByVisibleText(conditionValue);
  }

  /**
   * Inputs the date for the condition
   * @param dd
   * @param mm
   * @param yyyy
   */
  enterDate(dd, mm, yyyy) {
    browser.$("#cond-value-year").setValue(yyyy);
    browser.$("#cond-value-month").setValue(mm);
    browser.$("#cond-value-day").setValue(dd);
  }

  getCondition() {
    return browser.$("#condition-string");
  }
}

module.exports = new AddConditionSection();
