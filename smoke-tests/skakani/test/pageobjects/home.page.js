import Page from "./page";

class HomePage extends Page {
  /**
   * define elements
   */
  get pageTitle() {
    return browser.getTitle();
  }

  /**
   * define elements
   */
  get pageText() {
    return $("label=Create a new form");
  }

  /**
   * define or overwrite page methods
   */
  open() {
    super.open("new");
  }
}

export default new HomePage();
