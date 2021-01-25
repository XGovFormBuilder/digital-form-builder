const Section = require("./section");

class EditSections extends Section {
  get addSection() {
    return browser.$("a=Add section");
  }

  get sectionLinks() {
    return browser.$$("ul.govuk-list li a");
  }

  get sectionSaveBtn() {
    return browser.$(".govuk-button=Save");
  }
}

module.exports = new EditSections();
