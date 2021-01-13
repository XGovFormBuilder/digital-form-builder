const Section = require("./section");

class EditListsSection extends Section {
  get addNewList() {
    return this.parentElement.$("a=Add a new list");
  }

  get listTitle() {
    return browser.$("input#list-title");
  }

  get createListItem() {
    return browser.$("a=Create list item");
  }

  itemTitle(title) {
    browser.$("#title").waitForDisplayed();
    return browser.$("#title").setValue(title);
  }

  helpText(text) {
    return browser.$(".govuk-textarea").setValue(text);
  }

  itemValue(value) {
    return browser.$("#value").setValue(value);
  }

  get saveButton() {
    browser.$$(".govuk-button=Save")[1].waitForClickable();
    return browser.$$(".govuk-button=Save")[1];
  }

  /**
   * Adds one list item to a global list
   * @param title
   * @param text
   * @param value
   */
  addNewListItem(title, text, value) {
    this.itemTitle(title);
    this.helpText(text);
    this.itemValue(value);
    this.saveButton.scrollIntoView();
    this.saveButton.click();
  }
}

module.exports = new EditListsSection();
