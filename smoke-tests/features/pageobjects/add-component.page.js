const Page = require("./page");

class AddComponentPage extends Page {
  get parent() {
    return $(".flyout-menu-container");
  }
  get selectList() {
    return this.parent.$(".govuk-select");
  }
  get titleField() {
    return this.parent.$("#field-title");
  }
  get nameField() {
    return this.parent.$("#field-name");
  }
  get hintField() {
    return this.parent.$("#field-hint");
  }
  get saveBtn() {
    return this.parent.$(".govuk-button");
  }

  selectComponentByName(name) {
    this.selectList.selectByVisibleText(name);
  }

  completeDateField(title, name, hint) {
    this.titleField.setValue(title);
    this.nameField.setValue(name);
    this.hintField.setValue(hint);
    this.saveBtn.click();
  }
}

module.exports = new AddComponentPage();
