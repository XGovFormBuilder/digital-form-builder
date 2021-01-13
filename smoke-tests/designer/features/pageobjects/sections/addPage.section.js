const Section = require("./section");

class AddPageSection extends Section {
  get sectionContainer() {
    return $(".flyout__container ");
  }

  linkFrom(pagePath) {
    this.sectionContainer.$("#link-from").waitForDisplayed();
    return this.sectionContainer.$("#link-from").selectByVisibleText(pagePath);
  }
}

module.exports = new AddPageSection();
