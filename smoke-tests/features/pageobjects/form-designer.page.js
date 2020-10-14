const Page = require("./page");

class FormDesignerPage extends Page {
  get designerMenu() {
    return $("div.menu");
  }

  get addComponentToPage() {
    return $("button=Create component");
  }

  get editPage() {
    return $("button=Edit page");
  }

  get formPages() {
    return $$(".page");
  }

  get formPageTitles() {
    return $$(".page__heading h3");
  }

  get linkLine() {
    return $("polyline");
  }

  dropdown(name) {
    return this.pageContainer(name).$(".dropdown");
  }

  emailComponent(pageName) {
    return this.pageContainer(pageName).$("div.email");
  }

  pageContainer(elem) {
    return $(`#\\/${elem.toLowerCase().replace(" ", "-")}`);
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

  getFormPageText() {
    this.formPages.filter((page) => {
      return console.log(page.getText());
    });
  }

  getNumberInArray(term) {
    return this.formPageTitles.filter((value) => {
      return value.getText() === term;
    }).length;
  }
}

module.exports = new FormDesignerPage();
