import Page from "./page";

class HomePage extends Page {
  /**
   * define elements
   */
  get pageText() {
    return $("label.govuk-label govuk-label--m");
  }

  /**
   * define or overwrite page methods
   */
  open() {
    super.open("");
  }
}

export default new HomePage();
