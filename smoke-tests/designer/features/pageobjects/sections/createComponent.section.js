const Page = require("../pages/basePage");

class CreateComponentSection extends Page {
  get parent() {
    return browser.$(".panel--flyout");
  }

  get errorSummary() {
    return this.parent.$(".govuk-error-summary");
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

  get hideTitle() {
    return this.parent.$("#field-options-hideTitle");
  }

  get listOptions() {
    return this.parent.$("select#field-options-list").$$("option");
  }

  get fieldOptional() {
    return browser.$("#field-options-required");
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
  completeCommonFields(
    dataObject,
    hideTitle = false,
    makeOptional = false,
    save = true
  ) {
    this.titleField.setValue(dataObject.title);
    this.hintField.setValue(dataObject.hint);
    this.nameField.setValue(dataObject.name);
    if (hideTitle) {
      this.hideTitle.click();
    }
    if (makeOptional) {
      this.fieldOptional.click();
    }
    if (save) {
      this.saveBtn.click();
    }
  }

  /**
   * Selects an entry from the select list by name
   * @param listName
   */
  selectList(listName) {
    return browser.$("#field-options-list").selectByVisibleText(listName);
  }
}

module.exports = new CreateComponentSection();
