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
}

module.exports = new EditPageSection();
