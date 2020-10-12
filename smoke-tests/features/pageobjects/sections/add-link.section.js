const Section = require("./section");

class AddLinkSection extends Section {
  get parent () {
    return $(".flyout-menu-container");
  }  

  get fromSelectList() {
    return this.parent.$("#link-source");
  }

  get toSelectList() {
    return this.parent.$("#link-target");
  }
  
  selectFromByName(name) {
    this.fromSelectList.selectByVisibleText(name);
  }

  selectToByName(name) {
    this.toSelectList.selectByVisibleText(name);
  }
}

module.exports = new AddLinkSection();
