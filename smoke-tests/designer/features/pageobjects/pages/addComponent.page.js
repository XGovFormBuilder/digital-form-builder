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
    expect(this.backToComponentList).toBeDisplayed();
  }

  paragraphSetText(text) {
    $("[name='content']").setValue(text);
  }

  /**
   * Fills in the fields with data from the Object
   * @param dataObject
   * @param save
   */
  completeCommonFields(dataObject, save = true) {
    this.titleField.setValue(dataObject.title);
    this.hintField.setValue(dataObject.hint);
    this.nameField.setValue(dataObject.name);
    if (save) {
      this.saveBtn.click();
    }
  }
}

module.exports = new AddComponentPage();
