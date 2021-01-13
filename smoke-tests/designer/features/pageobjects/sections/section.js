module.exports = class Section {
  get parentElement() {
    return browser.$(".flyout__container div.panel");
  }

  get pageTitle() {
    browser.$("#page-title").waitForDisplayed();
    return browser.$("#page-title");
  }

  get sectionTitle() {
    return browser.$("#section-title");
  }

  get saveBtn() {
    return browser.$(".govuk-button=Save");
  }

  get closeSection() {
    return browser.$("=Close");
  }
};
