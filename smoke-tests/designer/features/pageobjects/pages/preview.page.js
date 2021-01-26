const Page = require("./basePage");

class PreviewPage extends Page {
  get title() {
    return browser.$("h1 .govuk-label");
  }

  hintText(componentName) {
    browser.$(`#${componentName}-hint`);
  }

  getComponent(componentName) {
    browser.$(`#${componentName}`);
  }
}
