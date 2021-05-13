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

  get formPages() {
    return browser.$$(".page");
  }

  get linkLine() {
    return $("polyline");
  }

  pagesLink(fromPage, toPage) {
    let pageLink = fromPage.replace(" ", "-") + "-" + toPage.replace(" ", "-");
    return browser.$(`[data-testid='${pageLink}']`);
  }

  dateField(name) {
    return this.pageContainer(name).react$("DateField");
  }

  datePartsField(name) {
    return this.pageContainer(name).react$("DatePartsField");
  }

  dateTimeField(name) {
    return this.pageContainer(name).react$("DateTimeField");
  }

  emailAddressField(pageName) {
    return this.pageContainer(pageName).react$("EmailAddressField");
  }

  flashCard(pageName) {
    return this.pageContainer(pageName).react$("FlashCard");
  }

  paragraph(pageName) {
    return this.pageContainer(pageName).react$("Para");
  }

  textField(pageName) {
    return this.pageContainer(pageName).react$("TextField");
  }

  getComponentOnPage(pageName, componentName) {
    const mappedName = ComponentMappings[componentName]
      ? ComponentMappings[componentName]
      : componentName;
    return this.pageContainer(pageName).react$(mappedName);
  }

  pageContainer(name) {
    return this.formPages.find((el) => el.getText().includes(name));
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

  createComponentForPageName(name) {
    return this.pageContainer(name).$("button=Create component");
  }

  editPageForPageName(name) {
    return this.pageContainer(name).$("button=Edit page");
  }

  previewPageForPageName(name) {
    return this.pageContainer(name).$(".page a");
  }

  dropdownComponentForPage(name) {
    return this.pageContainer(name).$(".dropdown");
  }

  addComponentToPageNumber(index) {
    return $$(".page .button")[index];
  }

  getPageIndex(name) {
    this.designerMenu.waitForDisplayed();
    return this.formPages.findIndex((elem) => {
      return elem.getText().includes(name);
    });
  }

  retrieveNumberOfPagesMatching(pageName) {
    return this.pageHeadingsText.filter((value) => {
      return value.getText() === pageName;
    }).length;
  }
}

module.exports = new FormDesignerPage();
