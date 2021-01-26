const Page = require("./basePage");

class PreviewPage extends Page {
  get pageTitle() {
    return browser.$$("h1")[0];
  }

  /**
   *
   * @param componentName
   */
  hintText(componentName) {
    return browser.$(`#${componentName}-hint`);
  }

  getComponent(componentName) {
    return browser.$(`#${componentName}`);
  }

  get paragraph() {
    return browser.$("p.govuk-body");
  }
}

module.exports = new PreviewPage();
