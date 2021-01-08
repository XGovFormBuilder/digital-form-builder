const Page = require("./basePage");

class AddComponentPage extends Page {
  get parent() {
    return $(".flyout-menu-container");
  }

  get addComponent() {
    return this.parent.$(".component-create");
  }

  get backToComponentList() {
    return this.parent.$("=Back to create component list");
  }

  get sectionHeading() {
    return this.parent.$("h4");
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

  get fromAList() {
    return this.parent.$("input#definitionType");
  }

  get listOptions() {
    return this.parent.$("select#field-options-list");
  }

  get saveBtn() {
    return this.parent.$(".govuk-button");
  }

  get deleteBtn() {
    return this.parent.$(".govuk-button=Delete");
  }

  selectComponentByName(name) {
    this.addComponent.waitForDisplayed();
    browser.$(`=${name}`).click();
  }

  paragraphSetText(text) {
    $("[name='content']").setValue(text);
  }

  completeCommonFields(dataObject) {
    this.titleField.setValue(dataObject.title);
    this.hintField.setValue(dataObject.hint);
    this.nameField.setValue(dataObject.name);
    this.saveBtn.click();
  }
}

module.exports = new AddComponentPage();
