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

  displayName(name) {
    return browser.$("#cond-name").setValue(name);
  }

  /**
   * Selects condition from select list
   * @param conditionName
   */
  selectCondition(conditionName) {
    return browser.$("#cond-field").selectByVisibleText(conditionName);
  }

  /**
   * Selects operator from select list
   * @param conditionName
   */
  selectOperator(conditionName) {
    browser.$("#cond-operator").waitForDisplayed();
    return browser.$("#cond-operator").selectByVisibleText(conditionName);
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
