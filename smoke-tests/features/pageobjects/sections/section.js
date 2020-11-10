module.exports = class Section {
  get parentElement() {
    return $(".flyout-menu-container div.panel");
  }

  get pageTitle() {
    return $("input#page-title");
  }

  get sectionTitle() {
    return $("input#section-title");
  }

  get saveBtn() {
    return this.parentElement.$(".govuk-button=Save");
  }

  get closeSection() {
    return $("a.close");
  }
};
