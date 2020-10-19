const Section = require("./section");

class EditPageSection extends Section {
  get parentElement() {
    return $(".flyout-menu-container");
  }

  get sectionDropdown() {
    return this.parentElement.$('select#page-section')
  }

  get duplicateBtn() {
    return this.parentElement.$(".govuk-button=Duplicate");
  }

  get deleteBtn() {
    return this.parentElement.$(".govuk-button=delete");
  }
}

module.exports = new EditPageSection();
