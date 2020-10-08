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

  get dropdown() {
    return $(".dropdown");
  }

  pageContainer(elem) {
    return $(`#\\/${elem}`);
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
      console.log(page.getText());
    });
  }
}
module.exports = new FormDesignerPage();
