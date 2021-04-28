const Section = require("./section");

class AddLinkSection extends Section {
  get parent() {
    return browser.$(".panel");
  }

  get fromSelectList() {
    return this.parent.$("#link-source");
  }

  get toSelectList() {
    return this.parent.$("#link-target");
  }

  get deleteBtn() {
    return browser.$(".govuk-button=Delete");
  }

  selectFromByName(name) {
    this.fromSelectList.selectByVisibleText(name);
  }

  selectToByName(name) {
    this.toSelectList.selectByVisibleText(name);
  }

  linkPages(fromPage, toPage) {
    this.selectFromByName(fromPage);
    this.selectToByName(toPage);
    this.saveBtn.click();
  }

  /**
   * Chooses a condition from the select list
   * @param conditionName
   */
  selectACondition(conditionName) {
    return this.parent
      .$("[data-testid='select-condition']")
      .selectByVisibleText(conditionName);
  }
}

module.exports = new AddLinkSection();
