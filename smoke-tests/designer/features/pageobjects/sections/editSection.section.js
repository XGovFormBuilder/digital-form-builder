const Section = require("./section");

class EditSections extends Section {
  get addSection() {
    return browser.$("a=Add section");
  }

  get sectionLinks() {
    return browser.$$("ul.govuk-list li a");
  }

  get sectionSaveBtn() {
    let buttonIndex = browser
      .$$(".panel--flyout h4")
      .findIndex((el) => el.getText() === "Add a new section");
    return browser.$$(".govuk-button=Save")[buttonIndex];
  }
}

module.exports = new EditSections();
