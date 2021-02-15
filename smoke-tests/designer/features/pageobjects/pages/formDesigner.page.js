const Page = require("./basePage");
const ComponentMappings = require("../../../support/componentMapping");

class FormDesignerPage extends Page {
  get addComponentToPage() {
    return browser.$("button=Create component");
  }

  get editPage() {
    return browser.$("button=Edit page");
  }

  get formPages() {
    return browser.$$(".page");
  }

  get formPageTitles() {
    return browser.$$(".page__heading h3");
  }

  get linkLine() {
    return $("polyline");
  }

  get pagesLink() {
    browser.react$("_n").waitForExist();
    return browser.react$("_n");
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

  getTitleTextForPage(name) {
    return this.pageContainer(name).$(".page__heading h3").getText();
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
      return elem.getText() == name;
    });
  }

  retrieveNumberOfPagesMatching(pageName) {
    return this.formPageTitles.filter((value) => {
      return value.getText() === pageName;
    }).length;
  }
}

module.exports = new FormDesignerPage();
