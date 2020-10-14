const Section = require("./section");

class EditPageSection extends Section {
  get parentElement() {
    return $(".flyout-menu-container");
  }
  get pageTitle() {
    return this.parentElement.$("input#page-title");
  }

  get sectionDropdown() {
    return this.parentElement.$('select#page-section')
  }

  get saveBtn() {
    return this.parentElement.$(".govuk-button=Save");
  }

  get duplicateBtn() {
    return this.parentElement.$(".govuk-button=Duplicate");
  }
}

module.exports = new EditPageSection();
