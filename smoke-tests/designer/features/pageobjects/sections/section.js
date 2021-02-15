module.exports = class Section {
  get parentElement() {
    return browser.$(".panel");
  }

  get pageTitle() {
    browser.$("#page-title").waitForDisplayed();
    return browser.$("#page-title");
  }

  get sectionTitle() {
    return browser.$("#section-title");
  }

  get saveBtn() {
    browser.$(".govuk-button=Save").scrollIntoView();
    return browser.$(".govuk-button=Save");
  }

  get closeLinks() {
    return browser.$$("=Close");
  }

  /**
   * Clicks on a single link of a specified name
   * @param linkName
   */
  clickLink(linkName) {
    browser.$(`=${linkName}`).waitForDisplayed();
    browser.$(`=${linkName}`).click();
  }

  clickDataTestId(dataTestId) {
    browser.$(`[data-testid='${dataTestId}']`).click();
  }
};
