/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
module.exports = class Page {
  get errorSummary() {
    return browser.$(".govuk-error-summary");
  }

  get errorSummaryHeading() {
    return this.errorSummary.$("h2");
  }

  errorSummaryErrors(index) {
    return browser.$$(".govuk-error-summary__body ul li a")[index];
  }

  get designerMenu() {
    return $("nav.menu");
  }

  get saveBtn() {
    return this.parent.$(".govuk-button");
  }

  /**
   * Opens a sub page of the page
   * @param path path of the sub page (e.g. /path/to/page.html)
   */
  open(path) {
    return browser.url(`/${path}`);
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
