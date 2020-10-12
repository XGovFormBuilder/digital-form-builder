class EditPageSection {
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
}

module.exports = new EditPageSection();
