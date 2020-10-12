const Section = require("./section");

class EditSections extends Section {
  get addSection() {
    return $("a=Add section");
  }

  get sectionLinks() {
    return $$('ul li a')
  }
}

module.exports = new EditSections();
