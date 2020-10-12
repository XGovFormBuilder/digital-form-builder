module.exports = class Section {
  get parentElement() {
    return $(".flyout-menu-container");
  }

  get saveBtn() {
    return this.parentElement.$(".govuk-button=Save");
  }
};
