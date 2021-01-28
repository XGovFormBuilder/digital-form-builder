const Page = require("./basePage");

class PreviewPage extends Page {
  get pageTitle() {
    return browser.$$("h1")[0];
  }

  /**
   * Retrieves the hint text element for a component
   * @param componentName
   * @returns {Element}
   */
  hintText(componentName) {
    return browser.$(`#${componentName}-hint`);
  }

  /**
   * Retrieves the element for the component
   * @param componentName
   * @returns {Element}
   */
  getComponent(componentName) {
    return browser.$(`#${componentName}`);
  }

  get paragraph() {
    return browser.$("p.govuk-body");
  }

  get listItems() {
    return browser.$$(".govuk-list--bullet li");
  }
}

module.exports = new PreviewPage();
