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

  retrieveNumberOfPagesMatching(pageName) {
    return this.formPageTitles.filter((value) => {
      return value.getText() === pageName;
    }).length;
  }
}

module.exports = new FormDesignerPage();
