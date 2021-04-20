const Section = require("./section");

class EditPageSection extends Section {
  get parentElement() {
    return browser.$(".panel");
  }

  get sectionDropdown() {
    return this.parentElement.$("select#page-section");
  }

  get deleteBtn() {
    return this.parentElement.$(".govuk-button=Delete");
  }
}

module.exports = new EditPageSection();
