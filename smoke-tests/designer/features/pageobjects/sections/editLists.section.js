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
    return browser.$('[data-testid="add-list"]');
  }

  get listTitle() {
    return browser.$("input#list-title");
  }

  get createListItem() {
    return browser.$('[data-testid="add-list-item"]');
  }

  itemTitle(title) {
    return browser.$('[data-testid="list-item-text"]').setValue(title);
  }

  helpText(text) {
    return browser.$('[data-testid="list-item-hint"]').setValue(text);
  }

  itemValue(value) {
    return browser.$('[data-testid="list-item-value"]').setValue(value);
  }

  get saveButton() {
    browser.$$(".govuk-button=Save")[1].waitForClickable();
    return browser.$$(".govuk-button=Save")[1];
  }

  /**
   * Adds one list item to a global list
   * @param panelName
   * @param title
   * @param text
   * @param value
   */
  addNewListItem(panelName, title, text, value) {
    let panelIndex = this.getPanel(panelName);
    this.itemTitle(title);
    this.helpText(text);
    this.itemValue(value);
    this.saveButton.scrollIntoView();
    this.saveButton.click();
  }

  get selectListValue() {
    return browser.$("#field-options-list");
  }

  get listItems() {
    return browser.$$(".govuk-table__body .govuk-table__row");
  }

  /**
   * Locates the index of the list item
   * @param listItemName
   * @returns {number}
   */
  getListItem(listItemName) {
    return this.listItems.findIndex((el) =>
      el.getText().includes(listItemName)
    );
  }

  /**
   * Clicks on Delete for the chosen list item
   * @param listItemIndex
   */
  deleteListItem(listItemIndex) {
    return this.listItems[listItemIndex].$("=Delete").click();
  }

  /**
   * Clicks on Edit for the chosen list item
   * @param listItemIndex
   */
  editListItem(listItemIndex) {
    return this.listItems[listItemIndex].$("=Edit").click();
  }

  /**
   * Creates a list with list items
   * @param listType
   * @param numberOfListItems
   */
  createListWithListItems(listType, numberOfListItems) {
    for (let i = 0; i < numberOfListItems; i++) {
      this.createListItem.click();
      this.addNewListItem(
        "Add a new list item",
        `${listType} list item ${i}`,
        `${i}`,
        `${i}`
      );
    }
  }
}

module.exports = new EditListsSection();
