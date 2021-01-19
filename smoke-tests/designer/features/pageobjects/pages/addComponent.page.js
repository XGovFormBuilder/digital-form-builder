const Page = require("./basePage");

class AddComponentPage extends Page {
  get parent() {
    return browser.$(".panel--flyout");
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
    this.parent.$("#field-title").waitForDisplayed();
    return this.parent.$("#field-title");
  }

  get nameField() {
    return this.parent.$("#field-name");
  }

  get hintField() {
    return this.parent.$("#field-hint");
  }

  get listOptions() {
    return this.parent.$("select#field-options-list");
  }

  get saveBtn() {
    return this.parent.$(".govuk-button");
  }

  get deleteLink() {
    return this.parent.$(".govuk-link=Delete");
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
