/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
module.exports = class Page {
  get designerMenu() {
    return browser.$(".menu");
  }

  get saveBtn() {
    return this.parent.$(".govuk-button");
  }

  /**
   * Used for clicking on a link with a specific name
   * @param linkName
   * @returns {Element}
   */
  clickLink(linkName) {
    return browser.$(`=${linkName}`).click();
  }

  /**
   * Opens a sub page of the page
   * @param path path of the sub page (e.g. /path/to/page.html)
   */
  open(path) {
    return browser.url(`/${path}`);
  }

  get govPhaseBanner() {
    return browser.$(".govuk-phase-banner");
  }

  get govFooter() {
    return browser.$("footer");
  }

  footerLinks(linkName) {
    return this.govFooter.$(`=${linkName}`);
  }

  verifyFooter() {
    const links = [
      "Cookies",
      "Accessibility Statement",
      "Terms and Conditions",
    ];
    links.forEach((link) =>
      expect(this.footerLinks(`${link}`)).toBeDisplayed()
    );
  }
};
