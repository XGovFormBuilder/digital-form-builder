module.exports = class Section {
  get parentElement() {
    return browser.$(".flyout-menu-container div.panel");
  }

  get pageTitle() {
    browser.$("input#page-title").waitForDisplayed();
    return browser.$("input#page-title");
  }

  get sectionTitle() {
    return browser.$("input#section-title");
  }

  get saveBtn() {
    return this.parentElement.$(".govuk-button=Save");
  }

  get closeSection() {
    return browser.$("a.close");
  }
};
