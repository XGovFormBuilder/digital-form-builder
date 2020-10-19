const Section = require("./section");

class EditListsSection extends Section {
  get addList() {
    return this.parentElement.$("a=Add list");
  }

  get listTitle() {
    return this.parentElement.$('input#list-title');
  }

  get add() {
    return this.parentElement.$('a=Add')
  }

  items(index) {
    return this.parentElement.$$("td.govuk-table__cell input.govuk-input")[index]
  }

  fillOutItems(text, value, description) {
    this.items(0).setValue(text)
    this.items(1).setValue(value)
    this.items(2).setValue(description)
    this.saveBtn.click();
  }
}

module.exports = new EditListsSection();
