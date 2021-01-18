const Section = require("./section");

class EditListsSection extends Section {
  /**
   * Allows scoping within a specific panel
   * @param panelIndex
   * @returns {Element}
   */
  panels(panelIndex) {
    return browser.$$(".panel")[panelIndex];
  }

  get panelHeadings() {
    return browser.$$(".panel h4");
  }

  /**
   * Retrieves the index of a panel using the heading name
   * @param name
   * @returns {number}
   */
  getPanel(name) {
    return this.panelHeadings.findIndex((el) => el.getText().includes(name));
  }

  get addNewList() {
    return this.parentElement.$("a=Add a new list");
  }

  get listTitle() {
    return browser.$("input#list-title");
  }

  get createListItem() {
    return browser.$("a=Create list item");
  }

  itemTitle(panelIndex, title) {
    return this.panels(panelIndex).$("#title").setValue(title);
  }

  helpText(panelIndex, text) {
    return this.panels(panelIndex).$(".govuk-textarea").setValue(text);
  }

  itemValue(panelIndex, value) {
    return this.panels(panelIndex).$("#value").setValue(value);
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
    let panelIndex = this.getPanel("Add a new list item");
    console.log(panelIndex);
    this.itemTitle(panelIndex, title);
    this.helpText(panelIndex, text);
    this.itemValue(panelIndex, value);
    this.saveButton.scrollIntoView();
    this.saveButton.click();
  }

  get selectListValue() {
    return browser.$("#field-options-list");
  }

  get listItems() {
    return browser.$$(".govuk-table__body .govuk-table__row");
  }

  getListItem(listItemName) {
    return this.listItems.findIndex((el) =>
      el.getText().includes(listItemName)
    );
  }

  deleteListItem(name) {
    let listItemIndex = this.getListItem(name);
    return this.listItems[listItemIndex].$("=Delete").click();
  }
}

module.exports = new EditListsSection();
