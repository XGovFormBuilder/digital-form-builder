const Section = require("./section");

class EditSections extends Section {
  get addSection() {
    return $("a=Add section");
  }

  get sectionLinks() {
    return $$('ul li a')
  }

  get sectionSaveBtn() {
    return $(".govuk-button=Save");
  }
}

module.exports = new EditSections();
