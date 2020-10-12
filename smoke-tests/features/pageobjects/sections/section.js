module.exports = class Section {
  get parentElement() {
    return $(".flyout-menu-container");
  }

  get pageTitle() {
    return $('.panel input#section-title')
  }

  get saveBtn() {
    return $(".govuk-button=Save");
  }

  get closeSection() {
    return $('a.close')
  }
};
