const Page = require("./basePage");
const FormPage = require("../../components/formPage.component");
const ComponentMappings = require("../../../support/componentMapping");

class FormDesignerPage extends Page {
  get pages() {
    return browser.$$(".page").map((page) => new FormPage(page));
  }

  get pageHeadingsText() {
    return this.pages.map((page) => page.heading.getText());
  }

  /**
   * Returns the heading element for a specific page
   * @param pageName
   * @returns {*}
   */
  pageHeading(pageName) {
    const chosenPage = this.pages.find(
      (page) => page.heading.getText() === pageName
    );
    return chosenPage.heading;
  }

  /**
   * Returns the edit page link for a specific page
   * @param pageName
   * @returns {*}
   */
  editPage(pageName) {
    const chosenPage = this.pages.find(
      (page) => page.heading.getText() === pageName
    );
    return chosenPage.editPage;
  }

  /**
   * Find the section name element for a specific page
   * @param pageName
   * @returns {*}
   */
  pageSectionName(pageName) {
    const chosenPage = this.pages.find((page) =>
      page.heading.getText().includes(pageName)
    );
    return chosenPage.section;
  }

  /**
   * Returns the create component link for a named page
   * @param pageName
   * @returns {any}
   */
  createComponent(pageName) {
    const chosenPage = this.pages.find((page) =>
      page.heading.getText().includes(pageName)
    );
    return chosenPage.createComponent;
  }

  /**
   * Returns the preview page link for a named page
   * @param pageName
   * @returns {any}
   */
  previewFormPage(pageName) {
    const chosenPage = this.pages.find((page) =>
      page.heading.getText().includes(pageName)
    );
    return chosenPage.previewPage;
  }

  get linkLine() {
    return $("polyline");
  }

  /**
   * Creates a link between two pages
   * @param fromPage
   * @param toPage
   * @returns {Element}
   */
  pagesLink(fromPage, toPage) {
    let pageLink = fromPage.replace(" ", "-") + "-" + toPage.replace(" ", "-");
    return browser.$(`[data-testid='${pageLink}']`);
  }

  getComponentOnPage(pageName, componentName) {
    const mappedName = ComponentMappings[componentName]
      ? ComponentMappings[componentName]
      : componentName;
    return this.pages
      .find((page) => page.heading.getText().includes(pageName))
      .parent.react$(mappedName);
  }

  /**
   * Clicks on a component within a form page
   * @param componentType
   */
  editPageComponent(componentType) {
    browser
      .$(`.component-${componentType.toLowerCase()}`)
      .waitForDisplayed({ interval: 1000 });
    browser.$(`.component-${componentType.toLowerCase()}`).click();
  }
}

module.exports = new FormDesignerPage();
