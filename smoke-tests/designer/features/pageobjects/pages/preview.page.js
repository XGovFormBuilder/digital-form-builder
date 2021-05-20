const Page = require("./basePage");

class PreviewPage extends Page {
  get sectionTitle() {
    return browser.$("#section-title");
  }

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

  get checkBoxes() {
    return browser.$$(".govuk-checkboxes__input");
  }

  get summaryList() {
    return browser.$(".govuk-summary-list");
  }

  get radioHelpText() {
    return browser.$$(".govuk-radios__hint");
  }

  get componentTitle() {
    return browser.$(".govuk-fieldset .govuk-fieldset__legend");
  }
}

module.exports = new PreviewPage();
